"use client";

import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  FileArchive,
  KeyRound,
  Shield,
  FolderTree,
  Cpu,
  HardDrive,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useSecureZip } from "@/hooks/useSecureZip";
import { Header } from "@/components/Header";
import { Dropzone } from "@/components/Dropzone";
import { FileList } from "@/components/FileList";
import { PasswordForm } from "@/components/PasswordForm";
import { ProgressBar } from "@/components/ProgressBar";
import { SuccessCard } from "@/components/SuccessCard";
import { VerifyModal } from "@/components/VerifyModal";
import { Footer } from "@/components/Footer";
import { formatBytes } from "@/services/fileScanner";

export default function Home() {
  const {
    files,
    password,
    confirmPassword,
    showPassword,
    archiveName,
    encryptionMode,
    progress,
    result,
    error,
    isGenerating,
    addFiles,
    removeFile,
    clearFiles,
    setPassword,
    setConfirmPassword,
    setShowPassword,
    setEncryptionMode,
    setArchiveName,
    generateZip,
    cancelGeneration,
    resetAll,
  } = useSecureZip();

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);

  const canGenerate =
    files.length > 0 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    password === confirmPassword &&
    !isGenerating;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Top Header */}
      <Header
        onReset={files.length > 0 ? resetAll : undefined}
        onOpenVerify={() => setIsVerifyModalOpen(true)}
        hasFiles={files.length > 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-b from-white via-white to-slate-50/80 dark:from-zinc-900/80 dark:via-zinc-900/50 dark:to-zinc-950/80 border border-slate-200/90 dark:border-zinc-800/80 p-6 sm:p-10 shadow-sm overflow-hidden backdrop-blur-xl">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Client-Side Web Cryptography</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Create Password-Protected{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                Encrypted ZIP Archives
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
              Generate AES-256 or native Windows-compatible ZIP files entirely in your browser.
              No files are ever uploaded to any server. Your data stays 100% private in local device memory.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs font-medium text-slate-600 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60">
                <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Zero Server Uploads
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60">
                <KeyRound className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Windows Explorer Compatible
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60">
                <Shield className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                AES-256 Military Grade
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60">
                <FolderTree className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Folder Trees Preserved
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 sm:p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs sm:text-sm text-red-700 dark:text-red-400 flex items-start gap-3.5 shadow-md shadow-red-500/5 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <strong className="font-bold block mb-0.5">Operation Notice</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Progress View */}
        {isGenerating && (
          <ProgressBar progress={progress} onCancel={cancelGeneration} />
        )}

        {/* Success View */}
        {result && !isGenerating && (
          <SuccessCard
            result={result}
            onVerify={() => setIsVerifyModalOpen(true)}
            onReset={resetAll}
          />
        )}

        {/* Core Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: File Ingestion & File Tree */}
          <div className="lg:col-span-7 space-y-6">
            <Dropzone
              onFilesSelected={addFiles}
              isLoading={isGenerating}
              fileCount={files.length}
            />

            <FileList
              files={files}
              onRemove={removeFile}
              onClearAll={clearFiles}
              disabled={isGenerating}
            />
          </div>

          {/* Right Column: Password, Settings & Action Rail */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <PasswordForm
              password={password}
              confirmPassword={confirmPassword}
              showPassword={showPassword}
              archiveName={archiveName}
              onArchiveNameChange={setArchiveName}
              encryptionMode={encryptionMode}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onToggleShowPassword={() => setShowPassword(!showPassword)}
              onEncryptionModeChange={setEncryptionMode}
              disabled={isGenerating}
            />

            {/* Live Target Archive Summary Card */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/60 backdrop-blur-xl p-5 shadow-sm space-y-3 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20 shadow-xs flex-shrink-0">
                    <FileArchive className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      Output Target
                    </div>
                    <div className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                      {archiveName || "secure-archive.zip"}
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20 flex-shrink-0">
                  {encryptionMode === "zipcrypto" ? "Windows Native" : "AES-256 Deflate"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-950/60">
                  <span className="text-slate-500 dark:text-zinc-400">Staged Files:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                    {files.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-950/60">
                  <span className="text-slate-500 dark:text-zinc-400">Uncompressed:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                    {formatBytes(totalBytes)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/80 backdrop-blur-xl p-5 sm:p-6 shadow-md space-y-4 transition-colors duration-200">
              <button
                type="button"
                disabled={!canGenerate}
                onClick={generateZip}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 ${
                  canGenerate
                    ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:via-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed border border-slate-200 dark:border-zinc-700/60"
                }`}
              >
                <Lock className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">
                  {encryptionMode === "zipcrypto"
                    ? "Create Windows Protected ZIP"
                    : "Create AES-256 Encrypted ZIP"}
                </span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </button>

              {/* Readiness status list */}
              <div className="space-y-1.5 text-xs text-slate-500 dark:text-zinc-400 px-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {files.length > 0 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-[9px]">1</span>
                    )}
                    <span>Files or folder selected</span>
                  </span>
                  <span className="font-mono text-[11px] font-semibold">
                    {files.length > 0 ? `${files.length} items` : "None"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {password.length > 0 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-[9px]">2</span>
                    )}
                    <span>Encryption password entered</span>
                  </span>
                  <span className="font-mono text-[11px] font-semibold">
                    {password.length > 0 ? "Set" : "Required"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {password && confirmPassword && password === confirmPassword ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-[9px]">3</span>
                    )}
                    <span>Password confirmation matches</span>
                  </span>
                  <span className="font-mono text-[11px] font-semibold">
                    {password && confirmPassword && password === confirmPassword
                      ? "Match"
                      : "Pending"}
                  </span>
                </div>
              </div>

              {files.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                  <button
                    type="button"
                    onClick={resetAll}
                    disabled={isGenerating}
                    className="text-xs font-semibold text-slate-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Workspace
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informational Security & Architecture Grid (Fills empty void) */}
        <div className="pt-6 border-t border-slate-200/90 dark:border-zinc-800/80 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Client-Side Security &amp; Encryption Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Engineered for zero-leakage, maximum compatibility, and absolute privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/50 border border-slate-200/90 dark:border-zinc-800 backdrop-blur-xl space-y-3 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20 flex items-center justify-center shadow-xs">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                100% In-Memory Processing
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Files are compressed and encrypted on your local machine using the browser’s Web Cryptography API and WebAssembly. Nothing is ever sent to a remote server.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/50 border border-slate-200/90 dark:border-zinc-800 backdrop-blur-xl space-y-3 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200/80 dark:border-teal-500/20 flex items-center justify-center shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Dual Encryption Standards
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Choose ZipCrypto for effortless native right-click extraction in Windows 10/11 Explorer, or AES-256 with PBKDF2 for high-security archival in 7-Zip &amp; WinRAR.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/50 border border-slate-200/90 dark:border-zinc-800 backdrop-blur-xl space-y-3 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200/80 dark:border-cyan-500/20 flex items-center justify-center shadow-xs">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Directory Hierarchy Fidelity
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Preserves complete folder trees, nested paths, and directory structures. Automatically disambiguates duplicate filenames in separate subdirectories.
              </p>
            </div>
          </div>

          {/* Dedicated Inspector Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-zinc-900/80 dark:to-cyan-950/30 border border-emerald-200/80 dark:border-emerald-500/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Have an existing encrypted ZIP archive?
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  Verify decryption passwords and inspect archive contents directly in browser memory without extracting to disk.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsVerifyModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-zinc-900 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex-shrink-0"
            >
              <KeyRound className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>Unlock &amp; Inspect Any ZIP</span>
            </button>
          </div>
        </div>
      </main>

      {/* Verification & Inspector Modal */}
      {isVerifyModalOpen && (
        <VerifyModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          currentResult={result}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
