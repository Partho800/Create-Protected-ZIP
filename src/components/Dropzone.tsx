"use client";

import React, { useRef, useState, DragEvent, ChangeEvent } from "react";
import { FolderUp, FileUp, UploadCloud, Layers } from "lucide-react";
import { processDataTransfer, processFileInput } from "@/services/fileScanner";
import { FileEntryItem } from "@/types/zip";

interface DropzoneProps {
  onFilesSelected: (items: FileEntryItem[]) => void;
  isLoading?: boolean;
  fileCount?: number;
}

export function Dropzone({ onFilesSelected, isLoading = false, fileCount = 0 }: DropzoneProps) {
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

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 text-center p-8 sm:p-10 ${
        isDragOver
          ? "border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-4 ring-emerald-500/20"
          : "border-zinc-700/80 hover:border-zinc-600 bg-zinc-900/40 hover:bg-zinc-900/60"
      }`}
    >
      {/* Hidden file inputs */}
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

      <div className="flex flex-col items-center max-w-md mx-auto">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 ${
            isDragOver
              ? "scale-110 bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/30"
              : "bg-zinc-800/80 text-emerald-400 border border-zinc-700/60"
          }`}
        >
          {isScanning ? (
            <Layers className="w-8 h-8 animate-pulse text-emerald-400" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-white mb-1.5">
          {isScanning
            ? "Scanning directory structure..."
            : isDragOver
            ? "Release to add files & folders"
            : fileCount > 0
            ? "Add more files or folders"
            : "Drag & drop files or full folders here"}
        </h3>

        <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
          Full folder trees, subdirectories, and duplicate filenames in separate folders are preserved automatically.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            type="button"
            disabled={isLoading || isScanning}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <FileUp className="w-4 h-4" />
            Select Files
          </button>

          <button
            type="button"
            disabled={isLoading || isScanning}
            onClick={() => folderInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/80 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <FolderUp className="w-4 h-4 text-emerald-400" />
            Select Complete Folder
          </button>
        </div>
      </div>
    </div>
  );
}
