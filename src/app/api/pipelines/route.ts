import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPipelineSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  stages: z.array(z.object({
    name: z.string().min(1, "Nome do estágio é obrigatório"),
  })),
  lostReasonIds: z.array(z.string()),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    console.log("Creating pipeline with data:", json);
    const body = createPipelineSchema.parse(json);

    const pipeline = await prisma.$transaction(async (tx) => {
      // Create pipeline
      const pipeline = await tx.pipeline.create({
        data: {
          name: body.name,
          order: 0,
        },
      });

      // Create stages
      await tx.stage.createMany({
        data: body.stages.map((stage, index) => ({
          name: stage.name,
          order: index,
          pipelineId: pipeline.id,
        })),
      });

      // Create pipeline lost reasons
      if (body.lostReasonIds.length > 0) {
        await tx.pipelineLostReason.createMany({
          data: body.lostReasonIds.map((lostReasonId, index) => ({
            pipelineId: pipeline.id,
            lostReasonId,
            order: index,
          })),
        });
      }

      return pipeline;
    });

    console.log("Pipeline created successfully:", pipeline);
    return NextResponse.json(pipeline, { status: 201 });
  } catch (error) {
    console.error("Error creating pipeline:", error);
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
        lostReasons: {
          where: {
            deletedAt: null,
          },
          include: {
            lostReason: true,
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
    console.error("Error fetching pipelines:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}