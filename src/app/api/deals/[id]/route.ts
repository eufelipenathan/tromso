import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dealSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        contact: true,
        stage: {
          include: {
            pipeline: true,
          },
        },
        lostReason: true,
      },
    });

    if (!deal) {
      return NextResponse.json(
        { error: "Negócio não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(deal);
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
    const body = dealSchema.parse(json);

    // Clean up empty strings to null
    const cleanData = Object.fromEntries(
      Object.entries(body).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );

    const deal = await prisma.deal.update({
      where: { id: params.id },
      data: cleanData,
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
    console.error("Error updating deal:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
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
    await prisma.deal.update({
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
