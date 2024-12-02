import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Recuperar Senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Digite seu email para receber instruções de recuperação
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}