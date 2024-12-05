"use client";

import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AuthContainerProps {
  children: React.ReactNode;
}

export function AuthContainer({ children }: AuthContainerProps) {
  const { theme } = useTheme();

  return (
    <>
      <div className={`theme-transition ${theme === 'dark' ? 'auth-background-dark' : 'auth-background-light'}`}>
        {/* Blue Hour Elements */}
        <div className="blue-hour-container">
          <div className="snow-layer" />
          <div className="blue-flow" />
          <div className="cyan-flow" />
        </div>

        {/* Aurora Elements */}
        <div className="aurora-container">
          <div className="aurora-ribbon" />
          <div className="aurora-ribbon" />
          <div className="aurora-ribbon" />
        </div>
      </div>

      <div className="auth-container">
        <ThemeToggle />
        <div className="auth-card">
          {children}
        </div>
      </div>
    </>
  );
}