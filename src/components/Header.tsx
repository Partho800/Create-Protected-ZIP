import React from "react";
import { Shield, Sparkles, RotateCcw, Lock } from "lucide-react";

interface HeaderProps {
  onReset?: () => void;
  onOpenVerify?: () => void;
  hasFiles: boolean;
}

export function Header({ onReset, onOpenVerify, hasFiles }: HeaderProps) {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Secure ZIP Creator
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-3 h-3" />
                AES-256
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Zero-knowledge, browser-encrypted archive generator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenVerify && (
            <button
              onClick={onOpenVerify}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition-colors border border-zinc-700/60"
              title="Unlock or inspect a ZIP archive with password"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unlock / Inspect ZIP</span>
            </button>
          )}

          {hasFiles && onReset && (
            <button
              onClick={onReset}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
              title="Reset files and settings"
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
