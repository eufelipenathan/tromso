import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSectionSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  entityType: z.string(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = createSectionSchema.parse(json);

    const section = await prisma.formSection.create({
      data: {
        ...body,
        order: 0,
      },
    });

    return NextResponse.json(section, { status: 201 });
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get("entityType");

  try {
    const sections = await prisma.formSection.findMany({
      where: {
        entityType: entityType || undefined,
        deletedAt: null,
      },
      include: {
        fields: {
          where: { deletedAt: null },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
