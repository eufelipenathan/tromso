import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createFieldSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  required: z.boolean().default(false),
  fullWidth: z.boolean().default(false),
  options: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const body = createFieldSchema.parse(json);

    // Get current max order
    const maxOrder = await prisma.customField.findFirst({
      where: {
        sectionId: params.id,
        deletedAt: null,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const field = await prisma.customField.create({
      data: {
        ...body,
        sectionId: params.id,
        order: maxOrder ? maxOrder.order + 1 : 0,
      },
    });

    return NextResponse.json(field, { status: 201 });
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