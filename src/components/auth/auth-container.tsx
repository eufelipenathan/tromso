"use client";

import { useTheme } from "next-themes";

interface AuthContainerProps {
  children: React.ReactNode;
}

export function AuthContainer({ children }: AuthContainerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <>
      <div className={isDark ? "auth-background-dark" : "auth-background-light"}>
        <div className="aurora-container">
          <div className="aurora-ribbon" />
          <div className="aurora-ribbon" />
          <div className="aurora-ribbon" />
        </div>
      </div>
      <div className="auth-container">
        <div className="auth-card">
          {children}
        </div>
      </div>
    </>
  );
}