import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createInteractionSchema = z.object({
  type: z.enum(["email", "call", "meeting", "task"]),
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().datetime(),
  companyId: z.string(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = createInteractionSchema.parse(json);

    const interaction = await prisma.interaction.create({
      data: body,
    });

    return NextResponse.json(interaction, { status: 201 });
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