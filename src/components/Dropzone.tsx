"use client";

import React, { useRef, useState, DragEvent, ChangeEvent } from "react";
import {
  FolderUp,
  FileUp,
  UploadCloud,
  Layers,
  Sparkles,
  FileText,
  FileCode,
  FileImage,
  ShieldCheck,
} from "lucide-react";
import { processDataTransfer, processFileInput } from "@/services/fileScanner";
import { FileEntryItem } from "@/types/zip";

interface DropzoneProps {
  onFilesSelected: (items: FileEntryItem[]) => void;
  isLoading?: boolean;
  fileCount?: number;
}

export function Dropzone({
  onFilesSelected,
  isLoading = false,
  fileCount = 0,
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isLoading || isScanning) return;

    try {
      setIsScanning(true);
      const items = await processDataTransfer(e.dataTransfer);
      if (items.length > 0) {
        onFilesSelected(items);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const items = processFileInput(e.target.files);
      onFilesSelected(items);
      e.target.value = "";
    }
  };

  const handleFolderInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const items = processFileInput(e.target.files);
      onFilesSelected(items);
      e.target.value = "";
    }
  };

  const handleLoadDemoFiles = () => {
    const demo1 = new File(
      ["# Confidential Project Report\n\n- Zero-knowledge encryption verified.\n- Encrypted in memory."],
      "confidential-report.md",
      { type: "text/markdown" }
    );
    const demo2 = new File(
      [JSON.stringify({ cipher: "AES-256-CTR", algorithm: "PBKDF2-HMAC-SHA256", env: "production" }, null, 2)],
      "vault-config.json",
      { type: "application/json" }
    );
    const demo3 = new File(
      ["Security Clearance: Level 5\nAll rights reserved.\nDate: 2026-10-12\n"],
      "clearance.txt",
      { type: "text/plain" }
    );

    const items: FileEntryItem[] = [
      {
        id: "demo-1-" + Date.now(),
        file: demo1,
        relativePath: "reports/confidential-report.md",
        size: demo1.size,
        type: "text/markdown",
        lastModified: demo1.lastModified || Date.now(),
      },
      {
        id: "demo-2-" + Date.now(),
        file: demo2,
        relativePath: "configs/vault-config.json",
        size: demo2.size,
        type: "application/json",
        lastModified: demo2.lastModified || Date.now(),
      },
      {
        id: "demo-3-" + Date.now(),
        file: demo3,
        relativePath: "records/clearance.txt",
        size: demo3.size,
        type: "text/plain",
        lastModified: demo3.lastModified || Date.now(),
      },
    ];

    onFilesSelected(items);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative rounded-3xl border-2 border-dashed transition-all duration-300 p-6 sm:p-10 backdrop-blur-xl text-center overflow-hidden ${
        isDragOver
          ? "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-500/10 shadow-2xl shadow-emerald-500/20 scale-[1.01]"
          : "border-slate-300/80 hover:border-emerald-500/60 bg-white/80 hover:bg-white dark:border-zinc-800 dark:hover:border-emerald-500/40 dark:bg-zinc-900/50 dark:hover:bg-zinc-900/80 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Background radial gradient accent */}
      <div className="absolute inset-0 bg-radial from-emerald-500/5 via-transparent to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />

      {/* Hidden file & folder inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        className="hidden"
        id="file-input"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderInputChange}
        // @ts-expect-error - webkitdirectory is standard for folder picker in modern browsers
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        id="folder-input"
      />

      <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
        {/* Animated Icon Circle */}
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center mb-5 transition-all duration-300 ${
            isDragOver
              ? "scale-110 bg-emerald-500 text-white shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-500/20"
              : "bg-gradient-to-b from-emerald-50 to-slate-100 dark:from-zinc-800 dark:to-zinc-900 text-emerald-600 dark:text-emerald-400 border border-slate-200/90 dark:border-zinc-700/80 shadow-md group-hover:scale-105"
          }`}
        >
          {isScanning ? (
            <Layers className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse text-emerald-600 dark:text-emerald-400" />
          ) : (
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          {isScanning
            ? "Scanning directory structure..."
            : isDragOver
            ? "Drop files or folders to add"
            : fileCount > 0
            ? "Drop more files or folders to append"
            : "Drag & drop files or full folders here"}
        </h3>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed max-w-md">
          Preserves nested folder trees, directory hierarchy, and filename paths. All encryption happens locally in your browser memory.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full mb-6">
          <button
            type="button"
            disabled={isLoading || isScanning}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <FileUp className="w-4 h-4" />
            <span>Select Files</span>
          </button>

          <button
            type="button"
            disabled={isLoading || isScanning}
            onClick={() => folderInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 border border-slate-300 dark:border-zinc-700 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <FolderUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Select Folder Tree</span>
          </button>

          {fileCount === 0 && (
            <button
              type="button"
              disabled={isLoading || isScanning}
              onClick={handleLoadDemoFiles}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 transition-all cursor-pointer"
              title="Quick test with 3 sample documents"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Load Demo Files</span>
            </button>
          )}
        </div>

        {/* Feature Badges Strip */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-200/80 dark:border-zinc-800/80 w-full">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800/60 font-medium">
            <FileText className="w-3 h-3 text-blue-500" />
            Docs &amp; PDFs
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800/60 font-medium">
            <FileImage className="w-3 h-3 text-pink-500" />
            Images &amp; Media
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800/60 font-medium">
            <FileCode className="w-3 h-3 text-cyan-500" />
            Code &amp; Repos
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 font-medium">
            <ShieldCheck className="w-3 h-3" />
            100% Client-Side
          </span>
        </div>
      </div>
    </div>
  );
}
