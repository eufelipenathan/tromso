import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePipelineSchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: params.id },
      include: {
        stages: {
          where: { deletedAt: null },
          orderBy: { order: "asc" },
          include: {
            deals: {
              where: { deletedAt: null },
              include: {
                company: true,
                contact: true,
              },
            },
          },
        },
      },
    });

    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(pipeline);
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
    const body = updatePipelineSchema.parse(json);

    const pipeline = await prisma.pipeline.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(pipeline);
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
    await prisma.pipeline.update({
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