import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { pipelineId, newIndex } = await request.json();

    // Get all pipelines ordered by current order
    const pipelines = await prisma.pipeline.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
    });

    // Find the pipeline to move
    const pipelineToMove = pipelines.find(p => p.id === pipelineId);
    if (!pipelineToMove) {
      return NextResponse.json(
        { error: "Pipeline não encontrado" },
        { status: 404 }
      );
    }

    // Update orders
    await prisma.$transaction(
      pipelines.map((pipeline, index) => {
        let newOrder = index;
        if (index === newIndex) {
          newOrder = pipelineToMove.order;
        } else if (
          (index > pipelineToMove.order && index <= newIndex) ||
          (index < pipelineToMove.order && index >= newIndex)
        ) {
          newOrder = index < pipelineToMove.order ? index + 1 : index - 1;
        }

        return prisma.pipeline.update({
          where: { id: pipeline.id },
          data: { order: newOrder },
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering pipelines:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}