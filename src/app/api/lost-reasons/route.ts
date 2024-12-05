import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createLostReasonSchema = z.object({
  name: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = createLostReasonSchema.parse(json);

    const lostReason = await prisma.lostReason.create({
      data: body,
    });

    return NextResponse.json(lostReason, { status: 201 });
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

export async function GET() {
  try {
    const lostReasons = await prisma.lostReason.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(lostReasons);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}