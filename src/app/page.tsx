"use client";

import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Layers,
  FileArchive,
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
    generateZip,
    cancelGeneration,
    resetAll,
  } = useSecureZip();

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const canGenerate =
    files.length > 0 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    password === confirmPassword &&
    !isGenerating;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]">
      {/* Top Header */}
      <Header
        onReset={files.length > 0 ? resetAll : undefined}
        onOpenVerify={() => setIsVerifyModalOpen(true)}
        hasFiles={files.length > 0}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs sm:text-sm text-red-400 flex items-start gap-3 shadow-lg shadow-red-500/5 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block mb-0.5">Operation Notice</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Progress or Success view */}
        {isGenerating && (
          <ProgressBar progress={progress} onCancel={cancelGeneration} />
        )}

        {result && !isGenerating && (
          <SuccessCard
            result={result}
            onVerify={() => setIsVerifyModalOpen(true)}
            onReset={resetAll}
          />
        )}

        {/* Core Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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

          {/* Right Column: Password, Settings & Action */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <PasswordForm
              password={password}
              confirmPassword={confirmPassword}
              showPassword={showPassword}
              encryptionMode={encryptionMode}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onToggleShowPassword={() => setShowPassword(!showPassword)}
              onEncryptionModeChange={setEncryptionMode}
              disabled={isGenerating}
            />

            {/* Auto-detected Output Archive Badge */}
            {files.length > 0 && (
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                    <FileArchive className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-zinc-400">Target Archive</div>
                    <div className="font-mono text-xs font-semibold text-emerald-300 truncate">
                      {archiveName}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {encryptionMode === "zipcrypto"
                      ? "Windows Native"
                      : "AES-256 (Level 9)"}
                  </span>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md space-y-3">
              <button
                type="button"
                disabled={!canGenerate}
                onClick={generateZip}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  canGenerate
                    ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:via-teal-300 hover:to-cyan-300 text-zinc-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>
                  {encryptionMode === "zipcrypto"
                    ? "Create Windows-Compatible Protected ZIP"
                    : "Create AES-256 Encrypted ZIP"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
                <span>
                  {files.length === 0
                    ? "Select files or a folder to begin"
                    : !password
                    ? "Enter an encryption password"
                    : password !== confirmPassword
                    ? "Password confirmation must match"
                    : `${files.length} items ready for encryption`}
                </span>
                {files.length > 0 && (
                  <button
                    type="button"
                    onClick={resetAll}
                    disabled={isGenerating}
                    className="text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Verification & Inspector Modal */}
      <VerifyModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        currentResult={result}
        initialPassword={password}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
