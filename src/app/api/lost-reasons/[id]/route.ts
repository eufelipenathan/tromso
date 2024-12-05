import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateLostReasonSchema = z.object({
  name: z.string().min(1).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lostReason = await prisma.lostReason.findUnique({
      where: { id: params.id },
      include: {
        deals: {
          where: { deletedAt: null },
          include: {
            company: true,
            contact: true,
          },
        },
      },
    });

    if (!lostReason) {
      return NextResponse.json(
        { error: "Motivo de perda não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(lostReason);
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
    const body = updateLostReasonSchema.parse(json);

    const lostReason = await prisma.lostReason.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(lostReason);
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.lostReason.update({
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