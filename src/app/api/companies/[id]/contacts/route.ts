import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        companyId: params.id,
        deletedAt: null,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}