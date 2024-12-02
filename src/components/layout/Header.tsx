import { UserNav } from "./user-nav";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-end px-6 gap-4">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}