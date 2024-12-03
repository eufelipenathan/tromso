import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { sectionId, newIndex } = await request.json();

    // Get all sections ordered by current order
    const sections = await prisma.formSection.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
    });

    // Find the section to move
    const sectionToMove = sections.find(s => s.id === sectionId);
    if (!sectionToMove) {
      return NextResponse.json(
        { error: "Seção não encontrada" },
        { status: 404 }
      );
    }

    // Update orders
    await prisma.$transaction(
      sections.map((section, index) => {
        let newOrder = index;
        if (index === newIndex) {
          newOrder = sectionToMove.order;
        } else if (
          (index > sectionToMove.order && index <= newIndex) ||
          (index < sectionToMove.order && index >= newIndex)
        ) {
          newOrder = index < sectionToMove.order ? index + 1 : index - 1;
        }

        return prisma.formSection.update({
          where: { id: section.id },
          data: { order: newOrder },
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering sections:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}