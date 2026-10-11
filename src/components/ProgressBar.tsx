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
    <div className="rounded-2xl border border-emerald-500/30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-emerald-500/10 space-y-4 transition-colors duration-200">
      {/* Header status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>
                {isFinalizing ? "Finalizing Secure Archive..." : "Encrypting Archive..."}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-mono">
                {progress.percentage}%
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono truncate max-w-xs sm:max-w-md">
              {progress.currentFileName || "Preparing files..."}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 dark:text-red-400 dark:hover:text-red-300 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:border-red-500/30 transition-colors"
          title="Cancel archiving"
        >
          <XCircle className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>

      {/* Progress Track */}
      <div className="space-y-1.5">
        <div className="w-full bg-slate-100 dark:bg-zinc-950 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-zinc-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-sm shadow-emerald-400/50"
            style={{ width: `${Math.max(3, progress.percentage)}%` }}
          />
        </div>

        {/* Metrics Row */}
        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400 font-mono pt-1">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>
              File {progress.currentFileIndex} of {progress.totalFiles}
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

