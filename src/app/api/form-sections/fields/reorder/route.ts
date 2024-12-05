import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { fieldId, newIndex, sectionId } = await request.json();

    // Get all fields for this section ordered by current order
    const fields = await prisma.customField.findMany({
      where: {
        sectionId,
        deletedAt: null,
      },
      orderBy: { order: 'asc' },
    });

    // Find the field to move
    const fieldToMove = fields.find(f => f.id === fieldId);
    if (!fieldToMove) {
      return NextResponse.json(
        { error: "Campo não encontrado" },
        { status: 404 }
      );
    }

    // Update orders
    await prisma.$transaction(
      fields.map((field, index) => {
        let newOrder = index;
        if (index === newIndex) {
          newOrder = fieldToMove.order;
        } else if (
          (index > fieldToMove.order && index <= newIndex) ||
          (index < fieldToMove.order && index >= newIndex)
        ) {
          newOrder = index < fieldToMove.order ? index + 1 : index - 1;
        }

        return prisma.customField.update({
          where: { id: field.id },
          data: { order: newOrder },
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering fields:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}