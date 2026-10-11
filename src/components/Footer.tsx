"use client";

import React from "react";
import { ShieldCheck, Lock, HardDrive, Cpu, Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/90 dark:border-zinc-800/90 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl text-slate-500 dark:text-zinc-500 text-xs py-10 px-4 sm:px-6 lg:px-8 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-slate-900 dark:text-zinc-200 font-bold tracking-tight">
              Secure ZIP Creator
            </span>
          </div>
          <span className="hidden sm:inline text-slate-300 dark:text-zinc-700">•</span>
          <span className="text-slate-600 dark:text-zinc-400">
            Zero-Knowledge Client-Side Web Cryptography
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-600 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
            <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            AES-256 + ZipCrypto
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
            <Cpu className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            Local Memory Only
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
            <HardDrive className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            ZIP64 Support
          </span>
        </div>
      </div>
    </footer>
  );
}
