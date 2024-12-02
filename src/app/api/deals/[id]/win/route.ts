import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deal = await prisma.deal.update({
      where: { id: params.id },
      data: {
        closedAt: new Date(),
        lostReasonId: null,
      },
    });

    return NextResponse.json(deal);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}