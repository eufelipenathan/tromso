import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Criar Conta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Preencha os dados abaixo para criar sua conta
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}