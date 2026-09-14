"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { siteConfig } from "@/site.config";

const THEME_KEY = `${siteConfig.brand.storagePrefix}_theme`;

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.getAttribute("data-theme") === "light");
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.setAttribute("data-theme", next ? "light" : "dark");
    try {
      localStorage.setItem(THEME_KEY, next ? "light" : "dark");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Passer en mode sombre" : "Passer en mode clair"}
      title={isLight ? "Mode sombre" : "Mode clair"}
      className={`hover:text-[var(--primary)] ${className}`}
    >
      {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}
