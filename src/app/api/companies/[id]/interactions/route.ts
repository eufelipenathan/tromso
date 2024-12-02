import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const interactions = await prisma.interaction.findMany({
      where: {
        companyId: params.id,
        deletedAt: null,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(interactions);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}