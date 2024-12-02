import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createStageSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stages = await prisma.stage.findMany({
      where: {
        pipelineId: params.id,
        deletedAt: null,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(stages);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const body = createStageSchema.parse(json);

    // Get current max order
    const maxOrder = await prisma.stage.findFirst({
      where: {
        pipelineId: params.id,
        deletedAt: null,
      },
      orderBy: {
        order: 'desc',
      },
      select: {
        order: true,
      },
    });

    const stage = await prisma.stage.create({
      data: {
        ...body,
        pipelineId: params.id,
        order: maxOrder ? maxOrder.order + 1 : 0,
      },
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