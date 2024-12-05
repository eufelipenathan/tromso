import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePipelineSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  stages: z.array(z.object({
    name: z.string().min(1, "Nome do estágio é obrigatório"),
  })).optional(),
  lostReasonIds: z.array(z.string()).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    console.log("Updating pipeline with data:", json);
    const body = updatePipelineSchema.parse(json);

    const pipeline = await prisma.$transaction(async (tx) => {
      // Update pipeline name if provided
      if (body.name) {
        await tx.pipeline.update({
          where: { id: params.id },
          data: { name: body.name },
        });
      }

      // Update stages if provided
      if (body.stages) {
        // Soft delete existing stages
        await tx.stage.updateMany({
          where: { 
            pipelineId: params.id,
            deletedAt: null
          },
          data: { deletedAt: new Date() },
        });

        // Create new stages
        await tx.stage.createMany({
          data: body.stages.map((stage, index) => ({
            name: stage.name,
            order: index,
            pipelineId: params.id,
          })),
        });
      }

      // Update lost reasons if provided
      if (body.lostReasonIds) {
        // Soft delete existing relationships
        await tx.pipelineLostReason.updateMany({
          where: { 
            pipelineId: params.id,
            deletedAt: null
          },
          data: { deletedAt: new Date() },
        });

        // Create new relationships
        if (body.lostReasonIds.length > 0) {
          await tx.pipelineLostReason.createMany({
            data: body.lostReasonIds.map((lostReasonId, index) => ({
              pipelineId: params.id,
              lostReasonId,
              order: index,
            })),
          });
        }
      }

      // Return updated pipeline
      return tx.pipeline.findUnique({
        where: { id: params.id },
        include: {
          stages: {
            where: { deletedAt: null },
            orderBy: { order: "asc" },
          },
          lostReasons: {
            where: { deletedAt: null },
            include: { lostReason: true },
            orderBy: { order: "asc" },
          },
        },
      });
    });

    console.log("Pipeline updated successfully:", pipeline);
    return NextResponse.json(pipeline);
  } catch (error) {
    console.error("Error updating pipeline:", error);
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
    await prisma.$transaction([
      // Soft delete stages
      prisma.stage.updateMany({
        where: { 
          pipelineId: params.id,
          deletedAt: null
        },
        data: { deletedAt: new Date() },
      }),
      // Soft delete lost reason relationships
      prisma.pipelineLostReason.updateMany({
        where: { 
          pipelineId: params.id,
          deletedAt: null
        },
        data: { deletedAt: new Date() },
      }),
      // Soft delete pipeline
      prisma.pipeline.update({
        where: { id: params.id },
        data: { deletedAt: new Date() },
      }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting pipeline:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}