import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loseDealSchema = z.object({
  lostReasonId: z.string(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const body = loseDealSchema.parse(json);

    const deal = await prisma.deal.update({
      where: { id: params.id },
      data: {
        closedAt: new Date(),
        lostReasonId: body.lostReasonId,
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