import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateStageSchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stage = await prisma.stage.findUnique({
      where: { id: params.id },
      include: {
        pipeline: true,
        deals: {
          where: { deletedAt: null },
          include: {
            company: true,
            contact: true,
          },
        },
      },
    });

    if (!stage) {
      return NextResponse.json(
        { error: "Estágio não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(stage);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const body = updateStageSchema.parse(json);

    const stage = await prisma.stage.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(stage);
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
    await prisma.stage.update({
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