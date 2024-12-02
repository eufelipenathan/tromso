import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { stageId, newIndex } = await request.json();

    // Get all stages for this pipeline ordered by current order
    const stages = await prisma.stage.findMany({
      where: {
        pipelineId: params.id,
        deletedAt: null,
      },
      orderBy: { order: 'asc' },
    });

    // Find the stage to move
    const stageToMove = stages.find(s => s.id === stageId);
    if (!stageToMove) {
      return NextResponse.json(
        { error: "Estágio não encontrado" },
        { status: 404 }
      );
    }

    // Update orders
    await prisma.$transaction(
      stages.map((stage, index) => {
        let newOrder = index;
        if (index === newIndex) {
          newOrder = stageToMove.order;
        } else if (
          (index > stageToMove.order && index <= newIndex) ||
          (index < stageToMove.order && index >= newIndex)
        ) {
          newOrder = index < stageToMove.order ? index + 1 : index - 1;
        }

        return prisma.stage.update({
          where: { id: stage.id },
          data: { order: newOrder },
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering stages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}