import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateDealSchema = z.object({
  stageId: z.string(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const body = updateDealSchema.parse(json);

    const deal = await prisma.deal.update({
      where: { id: params.id },
      data: { stageId: body.stageId },
      include: {
        company: true,
        contact: true,
        stage: {
          include: {
            pipeline: true,
          },
        },
      },
    });

    return NextResponse.json(deal);
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