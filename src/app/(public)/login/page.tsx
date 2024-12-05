import { LoginForm } from "@/components/auth/login-form";
import { AuthContainer } from "@/components/auth/auth-container";

export default function LoginPage() {
  return (
    <AuthContainer>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entre com suas credenciais para acessar o sistema
        </p>
      </div>
      <LoginForm />
    </AuthContainer>
  );
}