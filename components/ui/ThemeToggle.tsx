"use client";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [icon, setIcon] = useState<React.ReactNode>(
    resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />
  );
  useEffect(() => {
    setIcon(resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />);
  }, [resolvedTheme]);
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 50 }}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle dark mode"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        icon={icon}
      />
    </div>
  );
}
