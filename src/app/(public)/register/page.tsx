import { RegisterForm } from "@/components/auth/register-form";
import { AuthContainer } from "@/components/auth/auth-container";

export default function RegisterPage() {
  return (
    <AuthContainer>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Criar Conta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Preencha os dados abaixo para criar sua conta
        </p>
      </div>
      <RegisterForm />
    </AuthContainer>
  );
}