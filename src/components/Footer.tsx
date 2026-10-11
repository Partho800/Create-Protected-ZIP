import React from "react";
import { ShieldCheck, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 text-slate-500 dark:text-zinc-500 text-xs py-8 px-4 sm:px-6 mt-auto transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-slate-800 dark:text-zinc-300 font-medium">Secure ZIP Creator</span>
          <span>•</span>
          <span>100% Client-Side Web Cryptography</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-slate-500 dark:text-zinc-400">
          <span>No Server Uploads</span>
          <span>•</span>
          <span>Zero Knowledge</span>
          <span>•</span>
          <span>Open Source</span>
        </div>
      </div>
    </footer>
  );
}

