"use client";

import React, { useState, useEffect, ChangeEvent, useRef } from "react";
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
  Download,
  FileText,
  FileCode,
  FileImage,
  File as FileGeneric,
  Copy,

  Check,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { ZipVerificationResult, ZipResult } from "@/types/zip";
import {
  verifyZipArchive,
  extractZipEntry,
  triggerBrowserDownload,
  DecryptedEntryContent,
} from "@/services/zipService";
import { formatBytes } from "@/services/fileScanner";

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResult: ZipResult | null;
}

interface ActivePreviewState {
  filename: string;
  size: number;
  text?: string;
  objectUrl?: string;
  isText: boolean;
  isImage: boolean;
  mimeType: string;
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

  // File Viewer (Preview) State
  const [activePreview, setActivePreview] = useState<ActivePreviewState | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Keep a ref to the current active preview so cleanup can always revoke object URLs
  const activePreviewRef = useRef<ActivePreviewState | null>(null);
  activePreviewRef.current = activePreview;

  /**
   * Completely purges all decrypted data, temporary blob URLs, verification results,
   * passwords, and resets locking state to enforce security.
   */
  const clearTemporaryDecryptedData = () => {
    if (activePreviewRef.current?.objectUrl) {
      try {
        URL.revokeObjectURL(activePreviewRef.current.objectUrl);
      } catch (_) {}
    }
    setActivePreview(null);
    setVerification(null);
    setIsUnlocked(false);
    setEnteredPassword("");
    setErrorMessage(null);
    setPreviewLoading(null);
    setCopiedText(false);
  };

  // Reset state and wipe temporary data whenever modal opens or unmounts
  useEffect(() => {
    if (isOpen) {
      clearTemporaryDecryptedData();

      if (currentResult?.blob) {
        setActiveBlob(currentResult.blob);
        setArchiveSourceTitle(currentResult.fileName);
      } else {
        setActiveBlob(null);
        setArchiveSourceTitle("");
      }
    }

    return () => {
      // Cleanup on unmount or when closed: guarantee all decrypted references and memory are purged
      clearTemporaryDecryptedData();
    };
  }, [isOpen, currentResult]);

  // Handle ESC key to lock and exit cleanly
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (activePreview) {
          handleExitFileViewer();
        } else {
          handleLockAndClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activePreview]);

  /**
   * Authenticates password against the archive and unlocks entry metadata.
   */
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

  /**
   * Opens an individual file inside the File Viewer by decrypting it with verified password.
   */
  const handleOpenFile = async (filename: string) => {
    if (!activeBlob || !enteredPassword) return;

    setPreviewLoading(filename);
    setErrorMessage(null);

    try {
      const extracted: DecryptedEntryContent = await extractZipEntry(
        activeBlob,
        filename,
        enteredPassword
      );

      let objectUrl: string | undefined = undefined;
      if (extracted.isImage || !extracted.isText) {
        objectUrl = URL.createObjectURL(extracted.blob);
      }

      setActivePreview({
        filename: extracted.filename,
        size: extracted.size,
        text: extracted.text,
        objectUrl,
        isText: extracted.isText,
        isImage: extracted.isImage,
        mimeType: extracted.mimeType,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || `Failed to decrypt file "${filename}".`);
    } finally {
      setPreviewLoading(null);
    }
  };

  /**
   * Downloads an individual decrypted file directly.
   */
  const handleDownloadDecryptedFile = async (filename: string) => {
    if (!activeBlob || !enteredPassword) return;
    try {
      const extracted = await extractZipEntry(activeBlob, filename, enteredPassword);
      triggerBrowserDownload(extracted.blob, filename.split("/").pop() || filename);
    } catch (err: any) {
      setErrorMessage(err?.message || `Failed to decrypt "${filename}" for download.`);
    }
  };

  /**
   * Exits the file viewer: cleans up decrypted data and automatically returns
   * to the locked state requiring the password again.
   */
  const handleExitFileViewer = () => {
    clearTemporaryDecryptedData();
  };

  /**
   * Locks the archive again manually while remaining in the modal.
   */
  const handleLockAgain = () => {
    clearTemporaryDecryptedData();
  };

  /**
   * Closes the modal and completely locks the archive and wipes state.
   */
  const handleLockAndClose = () => {
    clearTemporaryDecryptedData();
    onClose();
  };

  const handleCustomFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      clearTemporaryDecryptedData();
      setActiveBlob(file);
      setArchiveSourceTitle(file.name);
    }
  };

  const handleCopyPreviewText = () => {
    if (!activePreview?.text) return;
    navigator.clipboard?.writeText(activePreview.text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleLockAndClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl shadow-emerald-500/10 overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isUnlocked
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                  : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
              }`}
            >
              {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {activePreview
                  ? `Viewing: ${activePreview.filename.split("/").pop()}`
                  : isUnlocked
                  ? "Archive Unlocked"
                  : "Locked Secure Archive"}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-mono">
                  Protected
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {activePreview
                  ? "Exiting file viewer returns to locked state"
                  : isUnlocked
                  ? "Authentication verified • Contents accessible"
                  : "Password required to view or access files"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLockAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
            title="Close and lock archive"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Target File Info */}
          {!activePreview && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2.5 truncate">
                <FileArchive className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-slate-500 dark:text-zinc-400">Archive:</span>
                <span className="font-mono text-slate-900 dark:text-zinc-100 font-semibold truncate">
                  {archiveSourceTitle || "No archive loaded"}
                </span>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 transition-colors flex-shrink-0 border border-slate-200 dark:border-zinc-700/60 shadow-sm">
                <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                Upload Other ZIP
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleCustomFileInput}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* VIEW 1: LOCKED STATE (Password Required) */}
          {!isUnlocked ? (
            <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/50 p-6 sm:p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Archive Contents Are Locked
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  This archive is protected. Without the correct password, none of the files or
                  contents can be viewed or extracted. Closing returns to locked state.
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
                    className="w-full px-4 py-3 pr-10 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-700 dark:text-red-400 flex items-center gap-2.5 text-left">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !enteredPassword}
                  className="w-full py-3 px-5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-500 dark:via-teal-400 dark:to-cyan-400 hover:from-emerald-500 hover:via-teal-400 hover:to-cyan-400 text-white dark:text-zinc-950 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying &amp; Unlocking...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Unlock Archive</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : activePreview ? (
            /* VIEW 2: INDIVIDUAL FILE VIEWER */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* File Viewer Top Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleExitFileViewer}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-200/80 hover:bg-slate-300/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                  title="Close file and return to locked state"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Exit &amp; Lock File</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500 dark:text-zinc-400">
                    {formatBytes(activePreview.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownloadDecryptedFile(activePreview.filename)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Security Banner */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  <strong>Strict Security Notice:</strong> When you exit this file viewer or close
                  the window, the file automatically returns to the locked state. Re-opening will
                  require entering the password again.
                </span>
              </div>

              {/* File Content Display */}
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 overflow-hidden">
                {activePreview.isImage && activePreview.objectUrl ? (
                  <div className="p-4 flex items-center justify-center min-h-64 bg-slate-100/50 dark:bg-zinc-900/40">
                    <img
                      src={activePreview.objectUrl}
                      alt={activePreview.filename}
                      className="max-h-80 max-w-full rounded-xl object-contain shadow-md border border-slate-200 dark:border-zinc-800"
                    />
                  </div>
                ) : activePreview.isText && activePreview.text !== undefined ? (
                  <div>
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-100/70 dark:bg-zinc-900/60">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                        {activePreview.filename}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPreviewText}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100"
                      >
                        {copiedText ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-slate-800 dark:text-zinc-200 overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap select-text">
                      {activePreview.text}
                    </pre>
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <FileGeneric className="w-12 h-12 text-slate-400 mx-auto" />
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                        {activePreview.filename}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        Binary file ({formatBytes(activePreview.size)}) decrypted successfully.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadDecryptedFile(activePreview.filename)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Decrypted File</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* VIEW 3: UNLOCKED ARCHIVE FILE LIST */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Success Badge & Lock Again Button */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Decryption Verified &amp; Unlocked!
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Authentication verified with provided password.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLockAgain}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors border border-slate-200 dark:border-zinc-700 shadow-sm"
                  title="Lock archive now"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Lock Archive
                </button>
              </div>

              {/* Metrics */}
              {verification && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                    <div className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium">
                      Unlocked Entries
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mt-1">
                      {verification.entriesCount} files/folders
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                    <div className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium">
                      Uncompressed Size
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mt-1 font-mono">
                      {formatBytes(verification.totalUncompressedBytes)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 col-span-2 sm:col-span-1">
                    <div className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium">
                      Cipher Specification
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                      Authenticated
                    </div>
                  </div>
                </div>
              )}

              {/* Unlocked Entries List with Open / Download Actions */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Unlocked Files &amp; Directory Contents
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-500">
                    {verification?.entries.length} items decrypted
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
                  {verification?.entries.map((entry, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-800 dark:text-zinc-200 font-mono text-[11px] truncate">
                          {entry.filename}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-mono">
                          {formatBytes(entry.uncompressedSize)}
                        </span>

                        {!entry.directory && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={previewLoading === entry.filename}
                              onClick={() => handleOpenFile(entry.filename)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 transition-all disabled:opacity-50"
                              title={`Open and view ${entry.filename}`}
                            >
                              {previewLoading === entry.filename ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadDecryptedFile(entry.filename)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                              title={`Download ${entry.filename}`}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-zinc-900/50 flex justify-between items-center">
          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
            {isUnlocked ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Authenticated Session
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Lock className="w-3.5 h-3.5" />
                Encrypted Vault
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activePreview ? (
              <button
                type="button"
                onClick={handleExitFileViewer}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 dark:text-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
              >
                Close File &amp; Lock
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLockAndClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-transparent transition-colors"
              >
                Close &amp; Lock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
