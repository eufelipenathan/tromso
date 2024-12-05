import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const moveFieldSchema = z.object({
  targetSectionId: z.string().min(1, "Seção de destino é obrigatória"),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const { targetSectionId } = moveFieldSchema.parse(json);

    // Get current max order in target section
    const maxOrder = await prisma.customField.findFirst({
      where: {
        sectionId: targetSectionId,
        deletedAt: null,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    // Move field to target section
    const field = await prisma.customField.update({
      where: { id: params.id },
      data: {
        sectionId: targetSectionId,
        order: maxOrder ? maxOrder.order + 1 : 0,
      },
    });

    return NextResponse.json(field);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}