"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Download,
  ShieldCheck,
  Copy,
  Check,
  Search,
  RotateCcw,
  FileArchive,
  Lock,
} from "lucide-react";
import { ZipResult } from "@/types/zip";
import { formatBytes } from "@/services/fileScanner";
import { triggerBrowserDownload } from "@/services/zipService";

interface SuccessCardProps {
  result: ZipResult;
  onVerify: () => void;
  onReset: () => void;
}

export function SuccessCard({ result, onVerify, onReset }: SuccessCardProps) {
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(result.sha256).then(() => {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    });
  };

  const handleDownloadAgain = () => {
    triggerBrowserDownload(result.blob, result.fileName);
  };

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-emerald-500/10 space-y-6 transition-colors duration-200">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/15">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Secure Archive Generated!
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                Encrypted
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Download initiated automatically. Your file is ready.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadAgain}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 shadow-md shadow-emerald-600/20 dark:shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Download Again
          </button>
        </div>
      </div>

      {/* Archive Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
        <div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium">Archive Name</div>
          <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate mt-0.5 font-mono">
            {result.fileName}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium">Encrypted Size</div>
          <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 font-mono">
            {formatBytes(result.fileSize)}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium">Entries Archived</div>
          <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 font-mono">
            {result.totalEntries} files/folders
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium">Cipher Specification</div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
            Password Protected
          </div>
        </div>
      </div>

      {/* SHA-256 Checksum */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            SHA-256 Integrity Fingerprint:
          </span>
          <button
            type="button"
            onClick={handleCopyHash}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
          >
            {copiedHash ? (
              <>
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Hash</span>
              </>
            )}
          </button>
        </div>
        <div className="font-mono text-[11px] text-slate-800 dark:text-zinc-300 break-all select-all bg-slate-100 dark:bg-zinc-900/60 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800">
          {result.sha256}
        </div>
      </div>

      {/* Security Note */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800/80 text-[11px] text-slate-600 dark:text-zinc-400 flex items-start gap-2">
        <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Protection Notice:</strong> All file contents inside this archive are encrypted. When opening or extracting files, your password is required to decrypt the contents.
        </span>
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/80 dark:border-zinc-800/60">
        <button
          type="button"
          onClick={onVerify}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 dark:text-emerald-400 dark:hover:text-emerald-300 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:border-emerald-500/30 transition-colors"
        >
          <Lock className="w-3.5 h-3.5" />
          Unlock &amp; View ZIP with Password
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-zinc-400 dark:hover:text-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-transparent transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Create Another Archive
        </button>
      </div>
    </div>
  );
}

