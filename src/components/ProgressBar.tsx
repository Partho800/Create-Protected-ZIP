"use client";

import React from "react";
import { Loader2, XCircle, Lock, ShieldCheck } from "lucide-react";
import { ZipProgress } from "@/types/zip";
import { formatBytes } from "@/services/fileScanner";

interface ProgressBarProps {
  progress: ZipProgress;
  onCancel: () => void;
}

export function ProgressBar({ progress, onCancel }: ProgressBarProps) {
  const isFinalizing = progress.status === "finalizing";

  return (
    <div className="rounded-3xl border border-emerald-500/40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl p-6 sm:p-7 shadow-xl shadow-emerald-500/10 space-y-5 transition-all duration-200">
      {/* Header status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 shadow-xs">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>
                {isFinalizing ? "Finalizing & Computing SHA-256..." : "Encrypting Archive..."}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                {progress.percentage}%
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono truncate max-w-xs sm:max-w-md mt-0.5">
              {progress.currentFileName || "Preparing files..."}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 dark:text-red-400 dark:hover:text-red-300 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:border-red-500/30 transition-colors cursor-pointer"
          title="Cancel archiving"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Progress Track */}
      <div className="space-y-2">
        <div className="w-full bg-slate-100 dark:bg-zinc-950 rounded-full h-3.5 overflow-hidden border border-slate-200 dark:border-zinc-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-sm shadow-emerald-400/50"
            style={{ width: `${Math.max(4, progress.percentage)}%` }}
          />
        </div>

        {/* Metrics Row */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 font-mono pt-1">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              Entry {progress.currentFileIndex} of {progress.totalFiles}
            </span>
          </div>

          <div>
            {formatBytes(progress.bytesProcessed)} / {formatBytes(progress.totalBytes)}
          </div>
        </div>
      </div>
    </div>
  );
}
