import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePipelineLostReasonsSchema = z.object({
  lostReasonIds: z.array(z.string()),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pipelineLostReasons = await prisma.pipelineLostReason.findMany({
      where: {
        pipelineId: params.id,
        deletedAt: null,
      },
      include: {
        lostReason: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(pipelineLostReasons);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const { lostReasonIds } = updatePipelineLostReasonsSchema.parse(json);

    // Soft delete existing relationships
    await prisma.pipelineLostReason.updateMany({
      where: { 
        pipelineId: params.id,
        deletedAt: null
      },
      data: { deletedAt: new Date() }
    });

    // Create new relationships with order
    await prisma.pipelineLostReason.createMany({
      data: lostReasonIds.map((id, index) => ({
        pipelineId: params.id,
        lostReasonId: id,
        order: index,
      })),
    });

    return NextResponse.json({ success: true });
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