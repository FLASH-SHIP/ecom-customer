"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@flash-ship/ecom-ui";

interface ThemeToggleProps {
  className?: string;
  storageKey?: string;
}

export function ThemeToggle({ className, storageKey: _storageKey }: ThemeToggleProps = {}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title="Toggle theme"
      className={className}
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

export default ThemeToggle;
