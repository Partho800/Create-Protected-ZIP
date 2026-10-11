"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  Upload,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import { ZipVerificationResult, ZipResult } from "@/types/zip";
import { verifyZipArchive } from "@/services/zipService";
import { formatBytes } from "@/services/fileScanner";

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResult: ZipResult | null;
  initialPassword?: string;
}

export function VerifyModal({
  isOpen,
  onClose,
  currentResult,
}: VerifyModalProps) {
  const [activeBlob, setActiveBlob] = useState<Blob | null>(null);
  const [archiveSourceTitle, setArchiveSourceTitle] = useState<string>("");
  const [enteredPassword, setEnteredPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [verification, setVerification] = useState<ZipVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state whenever modal opens or result changes
  useEffect(() => {
    if (isOpen) {
      setIsUnlocked(false);
      setEnteredPassword("");
      setErrorMessage(null);

      if (currentResult?.blob) {
        setActiveBlob(currentResult.blob);
        setArchiveSourceTitle(currentResult.fileName);
      } else {
        setActiveBlob(null);
        setArchiveSourceTitle("");
        setVerification(null);
      }
    }
  }, [isOpen, currentResult]);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeBlob) return;

    if (!enteredPassword) {
      setErrorMessage("Please enter the password to unlock this archive.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifyZipArchive(activeBlob, enteredPassword);
      setVerification(res);

      if (res.testDecryptionSuccess) {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
        setErrorMessage(
          res.testDecryptionError || "Incorrect password. Access denied. Contents remain encrypted."
        );
      }
    } catch (err: any) {
      setIsUnlocked(false);
      setErrorMessage(err?.message || "Failed to read or decrypt archive.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setActiveBlob(file);
      setArchiveSourceTitle(file.name);
      setEnteredPassword("");
      setIsUnlocked(false);
      setErrorMessage(null);
      setVerification(null);
    }
  };

  const handleLockAgain = () => {
    setIsUnlocked(false);
    setEnteredPassword("");
    setVerification(null);
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-emerald-500/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isUnlocked
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                {isUnlocked ? "Archive Unlocked" : "Locked Secure Archive"}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  AES-256
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                {isUnlocked
                  ? "Authentication verified • Contents unlocked"
                  : "Password required to view or access files"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Target File Info */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-xs">
            <div className="flex items-center gap-2.5 truncate">
              <FileArchive className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-zinc-400">Archive:</span>
              <span className="font-mono text-zinc-100 font-semibold truncate">
                {archiveSourceTitle || "No archive loaded"}
              </span>
            </div>

            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex-shrink-0 border border-zinc-700/60">
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              Upload Other ZIP
              <input
                type="file"
                accept=".zip"
                onChange={handleCustomFileInput}
                className="hidden"
              />
            </label>
          </div>

          {/* LOCKED STATE: NOTHING inside is shown without correct password! */}
          {!isUnlocked ? (
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 sm:p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-white">
                  Archive Contents Are Locked
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  This archive is protected with AES-256 encryption. Without the correct password,
                  none of the files or contents can be viewed or extracted.
                </p>
              </div>

              {/* Password prompt */}
              <form onSubmit={handleUnlock} className="space-y-4 max-w-md mx-auto pt-2">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={enteredPassword}
                    onChange={(e) => setEnteredPassword(e.target.value)}
                    placeholder="Enter password to unlock..."
                    disabled={loading}
                    className="w-full px-4 py-3 pr-10 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2.5 text-left">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !enteredPassword}
                  className="w-full py-3 px-5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:via-teal-300 hover:to-cyan-300 text-zinc-950 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? "Verifying..." : "Unlock Archive"}</span>
                </button>
              </form>
            </div>
          ) : (
            /* UNLOCKED STATE: Displays contents ONLY after correct password is authenticated! */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Success Badge */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-300">
                      Decryption Verified &amp; Unlocked!
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      HMAC AE-2 authentication code verified with AES-256.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLockAgain}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Lock Again
                </button>
              </div>

              {/* Metrics */}
              {verification && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="text-[11px] text-zinc-500 font-medium">Unlocked Entries</div>
                    <div className="text-xs font-semibold text-zinc-200 mt-1">
                      {verification.entriesCount} files/folders
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="text-[11px] text-zinc-500 font-medium">Uncompressed Size</div>
                    <div className="text-xs font-semibold text-zinc-200 mt-1 font-mono">
                      {formatBytes(verification.totalUncompressedBytes)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 col-span-2 sm:col-span-1">
                    <div className="text-[11px] text-zinc-500 font-medium">Cipher Specification</div>
                    <div className="text-xs font-semibold text-emerald-400 mt-1 font-mono">
                      AES-256 AE-2
                    </div>
                  </div>
                </div>
              )}

              {/* Unlocked Entries Table */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
                    Unlocked Files &amp; Directory Contents
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {verification?.entries.length} items decrypted
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 divide-y divide-zinc-800/60 text-xs">
                  {verification?.entries.map((entry, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2.5 flex items-center justify-between gap-3 font-mono text-[11px] hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Unlock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-zinc-200 truncate">{entry.filename}</span>
                      </div>
                      <div className="text-zinc-400 flex-shrink-0">
                        {formatBytes(entry.uncompressedSize)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800/80 bg-zinc-900/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
