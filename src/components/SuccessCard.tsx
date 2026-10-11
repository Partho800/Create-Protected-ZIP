"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Download,
  ShieldCheck,
  Copy,
  Check,
  RotateCcw,
  Lock,
  KeyRound,
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
    <div className="rounded-3xl border border-emerald-500/40 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 space-y-6 transition-all duration-200 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Encrypted Archive Ready!
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                {result.encryptionType?.toLowerCase().includes("zipcrypto") ? "ZipCrypto" : "AES-256"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
              Browser download initiated. Encrypted archive created directly in local memory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadAgain}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Again</span>
          </button>
        </div>
      </div>

      {/* Archive Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50/90 dark:bg-zinc-950/70 border border-slate-200/90 dark:border-zinc-800">
        <div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Archive Filename</div>
          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 truncate mt-0.5 font-mono">
            {result.fileName}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Encrypted Size</div>
          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5 font-mono">
            {formatBytes(result.fileSize)}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Entries Archived</div>
          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5 font-mono">
            {result.totalEntries} {result.totalEntries === 1 ? "entry" : "entries"}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Cipher Specification</div>
          <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
            {result.encryptionType?.toLowerCase().includes("zipcrypto") ? "Windows Native (ZipCrypto)" : "AES-256 (AE-2)"}
          </div>
        </div>
      </div>


      {/* SHA-256 Checksum */}
      <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-zinc-950/70 border border-slate-200/90 dark:border-zinc-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
          <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            SHA-256 Integrity Fingerprint:
          </span>
          <button
            type="button"
            onClick={handleCopyHash}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            {copiedHash ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Checksum</span>
              </>
            )}
          </button>
        </div>
        <div className="font-mono text-xs text-slate-800 dark:text-zinc-300 break-all select-all bg-white dark:bg-zinc-900/90 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800">
          {result.sha256}
        </div>
      </div>

      {/* Security Note */}
      <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-zinc-950/50 border border-slate-200/90 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-800 dark:text-zinc-200">Zero-Knowledge Notice:</strong> All encrypted contents require the exact password used during generation. Your password was not saved anywhere.
        </span>
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-zinc-800/60">
        <button
          type="button"
          onClick={onVerify}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 dark:text-emerald-400 dark:hover:text-emerald-300 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:border-emerald-500/30 transition-all cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Unlock &amp; Inspect Generated ZIP</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-zinc-400 dark:hover:text-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-transparent transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Create Another Archive</span>
        </button>
      </div>
    </div>
  );
}
