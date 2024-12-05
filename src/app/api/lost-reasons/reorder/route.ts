import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { reasonId, newIndex } = await request.json();

    // Get all reasons ordered by current order
    const reasons = await prisma.lostReason.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
    });

    // Find the reason to move
    const reasonToMove = reasons.find(r => r.id === reasonId);
    if (!reasonToMove) {
      return NextResponse.json(
        { error: "Motivo não encontrado" },
        { status: 404 }
      );
    }

    // Update orders
    await prisma.$transaction(
      reasons.map((reason, index) => {
        let newOrder = index;
        if (index === newIndex) {
          newOrder = reasonToMove.order;
        } else if (
          (index > reasonToMove.order && index <= newIndex) ||
          (index < reasonToMove.order && index >= newIndex)
        ) {
          newOrder = index < reasonToMove.order ? index + 1 : index - 1;
        }

        return prisma.lostReason.update({
          where: { id: reason.id },
          data: { order: newOrder },
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering reasons:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}