"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  const applyTheme = (targetTheme: "light" | "dark") => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (targetTheme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }
  };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      applyTheme(saved);
    } else {
      const isSystemDark =
        typeof window !== "undefined" && typeof window.matchMedia === "function"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
          : false;
      const initialTheme = isSystemDark ? "dark" : "light";
      setTheme(initialTheme);
      applyTheme(initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-200/60 dark:bg-zinc-800/60 border border-slate-300/60 dark:border-zinc-700/60 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white bg-white/90 hover:bg-slate-100 dark:bg-zinc-900/90 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      <div className="relative flex items-center justify-center w-5 h-5 rounded-lg bg-amber-500/10 dark:bg-zinc-800 text-amber-500 dark:text-amber-400">
        {isDark ? (
          <Sun className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </div>
      <span className="hidden sm:inline text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
        {isDark ? "Light" : "Dark"}
      </span>
    </button>
  );
}
