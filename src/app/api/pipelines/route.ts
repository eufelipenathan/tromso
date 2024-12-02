import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPipelineSchema = z.object({
  name: z.string().min(1),
  stages: z.array(
    z.object({
      name: z.string().min(1),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = createPipelineSchema.parse(json);

    const pipeline = await prisma.pipeline.create({
      data: {
        name: body.name,
        order: 0,
        stages: {
          create: body.stages.map((stage, index) => ({
            name: stage.name,
            order: index,
          })),
        },
      },
      include: {
        stages: true,
      },
    });

    return NextResponse.json(pipeline, { status: 201 });
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

export async function GET() {
  try {
    const pipelines = await prisma.pipeline.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        stages: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(pipelines);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}