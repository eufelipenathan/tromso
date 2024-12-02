import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entre com suas credenciais para acessar o sistema
        </p>
      </div>
      <LoginForm />
    </div>
  );
}