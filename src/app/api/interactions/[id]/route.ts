import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateInteractionSchema = z.object({
  type: z.enum(["email", "call", "meeting", "task"]).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const interaction = await prisma.interaction.findUnique({
      where: { id: params.id },
      include: {
        company: true,
      },
    });

    if (!interaction) {
      return NextResponse.json(
        { error: "Interação não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(interaction);
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
    const body = updateInteractionSchema.parse(json);

    const interaction = await prisma.interaction.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(interaction);
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
    await prisma.interaction.update({
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