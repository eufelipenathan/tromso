import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const websiteRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

const createCompanySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string()
    .refine(value => !value || websiteRegex.test(value), "Website inválido")
    .transform(value => {
      if (!value) return null;
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        return `https://${value}`;
      }
      return value;
    })
    .optional()
    .nullable(),
  cep: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  complement: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  mailbox: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    console.log("Iniciando criação de empresa");
    
    const json = await request.json();
    console.log("Dados recebidos:", json);

    // Clean up empty strings to null
    const cleanData = Object.fromEntries(
      Object.entries(json).map(([key, value]) => [
        key,
        value === "" ? null : value
      ])
    );

    const body = createCompanySchema.parse(cleanData);
    console.log("Dados validados:", body);

    const company = await prisma.company.create({
      data: body,
    });
    console.log("Empresa criada com sucesso:", company);

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar empresa:", error);

    if (error instanceof z.ZodError) {
      console.log("Erro de validação:", error.errors);
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
    const companies = await prisma.company.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}