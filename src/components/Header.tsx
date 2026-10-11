"use client";

import React from "react";
import { Shield, Sparkles, RotateCcw, KeyRound, Lock, Cpu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onReset?: () => void;
  onOpenVerify?: () => void;
  hasFiles: boolean;
}

export function Header({ onReset, onOpenVerify, hasFiles }: HeaderProps) {
  return (
    <header className="border-b border-slate-200/90 dark:border-zinc-800/90 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 flex-shrink-0 group">
            <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[14px] flex items-center justify-center transition-colors">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                Secure ZIP Creator
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20 shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
                <span>AES-256 + ZipCrypto</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 truncate">
              <span>Zero-knowledge client-side encryption</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <Cpu className="w-3 h-3" />
                100% In-Browser Memory
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Quick Inspector Trigger */}
          {onOpenVerify && (
            <button
              onClick={onOpenVerify}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 hover:text-slate-900 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:hover:text-white border border-slate-200/80 dark:border-zinc-800 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Unlock or inspect an existing protected ZIP archive"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Unlock / Inspect ZIP</span>
              <span className="sm:hidden">Inspect</span>
            </button>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Reset Workspace */}
          {hasFiles && onReset && (
            <button
              onClick={onReset}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition-all cursor-pointer"
              title="Reset workspace and clear files"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
