"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  FileCode,
  FileImage,
  FileArchive,
  File as FileGeneric,
  Trash2,
  FolderTree,
  Search,
  AlertTriangle,
  Folder,
} from "lucide-react";
import { FileEntryItem } from "@/types/zip";
import { formatBytes } from "@/services/fileScanner";

interface FileListProps {
  files: FileEntryItem[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  disabled?: boolean;
}

function getFileIcon(path: string) {
  const ext = path.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "ico"].includes(ext || "")) {
    return <FileImage className="w-4 h-4 text-pink-500 dark:text-pink-400" />;
  }
  if (["ts", "tsx", "js", "jsx", "html", "css", "py", "rs", "go", "json", "yml", "yaml", "sql", "sh"].includes(ext || "")) {
    return <FileCode className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />;
  }
  if (["zip", "tar", "gz", "rar", "7z", "bz2"].includes(ext || "")) {
    return <FileArchive className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
  }
  if (["md", "txt", "pdf", "docx", "xlsx", "pptx", "csv"].includes(ext || "")) {
    return <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
  }
  return <FileGeneric className="w-4 h-4 text-slate-400 dark:text-zinc-400" />;
}

export function FileList({
  files,
  onRemove,
  onClearAll,
  disabled = false,
}: FileListProps) {
  const [filterQuery, setFilterQuery] = useState("");

  const totalBytes = useMemo(() => {
    return files.reduce((acc, f) => acc + (f.size || 0), 0);
  }, [files]);

  const filteredFiles = useMemo(() => {
    if (!filterQuery.trim()) return files;
    const q = filterQuery.toLowerCase();
    return files.filter(
      (f) =>
        f.relativePath.toLowerCase().includes(q) ||
        f.file.name.toLowerCase().includes(q)
    );
  }, [files, filterQuery]);

  const directoryCount = useMemo(() => {
    const dirs = new Set<string>();
    files.forEach((f) => {
      const parts = f.relativePath.split("/");
      if (parts.length > 1) {
        dirs.add(parts.slice(0, -1).join("/"));
      }
    });
    return dirs.size;
  }, [files]);

  if (files.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/60 backdrop-blur-xl overflow-hidden shadow-sm transition-all duration-200">
      {/* Header bar */}
      <div className="p-4 sm:px-6 sm:py-4.5 border-b border-slate-200/90 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 dark:bg-zinc-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20 shadow-xs">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Staged Archive Entries
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                {files.length} {files.length === 1 ? "file" : "files"}
              </span>
              {directoryCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20 flex items-center gap-1">
                  <Folder className="w-3 h-3" />
                  {directoryCount} {directoryCount === 1 ? "folder" : "folders"}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Total uncompressed size:{" "}
              <strong className="text-slate-800 dark:text-zinc-200 font-mono">
                {formatBytes(totalBytes)}
              </strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {files.length > 5 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter files..."
                className="w-32 sm:w-44 pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 bg-white hover:bg-red-50 dark:bg-zinc-950 dark:hover:bg-red-500/10 border border-slate-200 hover:border-red-200 dark:border-zinc-800 dark:hover:border-red-500/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* List items */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60">
        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            No entries matched &ldquo;{filterQuery}&rdquo;
          </div>
        ) : (
          filteredFiles.map((item) => {
            const hasDirectory = item.relativePath.includes("/");
            const pathParts = item.relativePath.split("/");
            const fileName = pathParts.pop();
            const dirPrefix = pathParts.join("/");

            return (
              <div
                key={item.id}
                className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-850/50 transition-colors group text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
                    {getFileIcon(item.relativePath)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate flex items-center gap-1.5 font-mono">
                      {hasDirectory && (
                        <span className="text-slate-400 dark:text-zinc-500 font-normal truncate">
                          {dirPrefix}/
                        </span>
                      )}
                      <span className="text-slate-800 dark:text-zinc-200 font-medium truncate">
                        {fileName}
                      </span>
                    </div>

                    {item.isDuplicate && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        Disambiguated duplicate path
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                  <span className="text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                    {formatBytes(item.size)}
                  </span>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRemove(item.id)}
                    title={`Remove ${item.relativePath}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors opacity-70 group-hover:opacity-100 disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
