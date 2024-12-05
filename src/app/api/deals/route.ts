import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createDealSchema = z.object({
  title: z.string().min(1),
  value: z.number().min(0),
  companyId: z.string(),
  contactId: z.string(),
  stageId: z.string(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = createDealSchema.parse(json);

    const deal = await prisma.deal.create({
      data: body,
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

    return NextResponse.json(deal, { status: 201 });
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