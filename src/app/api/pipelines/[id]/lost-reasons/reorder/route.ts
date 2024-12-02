import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { reasonIds } = await request.json();

    // Get all pipeline lost reasons ordered by current order
    const pipelineLostReasons = await prisma.pipelineLostReason.findMany({
      where: {
        pipelineId: params.id,
        deletedAt: null,
      },
      orderBy: { order: 'asc' },
    });

    // Update orders
    await prisma.$transaction(
      reasonIds.map((reasonId: string, index: number) => {
        const pipelineLostReason = pipelineLostReasons.find(
          plr => plr.lostReasonId === reasonId
        );

        if (!pipelineLostReason) {
          throw new Error(`Pipeline lost reason not found for reasonId: ${reasonId}`);
        }

        return prisma.pipelineLostReason.update({
          where: { id: pipelineLostReason.id },
          data: { order: index },
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering pipeline lost reasons:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}