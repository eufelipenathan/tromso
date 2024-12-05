import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = forgotPasswordSchema.parse(json);

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      // Return success even if user doesn't exist for security
      return NextResponse.json({ success: true });
    }

    // TODO: Generate reset token and save to database
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=123`;

    await sendEmail({
      to: user.email,
      subject: "Recuperação de Senha",
      html: `
        <p>Olá ${user.name},</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Se você não solicitou a recuperação de senha, ignore este email.</p>
      `,
    });

    return NextResponse.json({ success: true });
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