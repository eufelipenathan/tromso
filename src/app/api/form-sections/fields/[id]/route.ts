import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateFieldSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  type: z.string().min(1, "Tipo é obrigatório").optional(),
  required: z.boolean().optional(),
  fullWidth: z.boolean().optional(),
  options: z.string().optional(),
  multiple: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const body = updateFieldSchema.parse(json);

    const field = await prisma.customField.update({
      where: { id: params.id },
      data: body,
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.customField.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}