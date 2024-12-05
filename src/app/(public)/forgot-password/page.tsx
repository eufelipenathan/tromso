import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthContainer } from "@/components/auth/auth-container";

export default function ForgotPasswordPage() {
  return (
    <AuthContainer>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Recuperar Senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Digite seu email para receber instruções de recuperação
        </p>
      </div>
      <ForgotPasswordForm />
    </AuthContainer>
  );
}