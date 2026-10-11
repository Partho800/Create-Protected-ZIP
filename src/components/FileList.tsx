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
} from "lucide-react";
import { FileEntryItem } from "@/types/zip";
import { formatBytes } from "@/services/fileScanner";

interface FileListProps {
  files: FileEntryItem[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  disabled?: boolean;
}

function getFileIcon(path: string, mime: string) {
  const ext = path.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext || "")) {
    return <FileImage className="w-4 h-4 text-pink-400" />;
  }
  if (["ts", "tsx", "js", "jsx", "html", "css", "py", "rs", "go", "json"].includes(ext || "")) {
    return <FileCode className="w-4 h-4 text-cyan-400" />;
  }
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext || "")) {
    return <FileArchive className="w-4 h-4 text-amber-400" />;
  }
  if (["md", "txt", "pdf", "docx", "csv"].includes(ext || "")) {
    return <FileText className="w-4 h-4 text-blue-400" />;
  }
  return <FileGeneric className="w-4 h-4 text-zinc-400" />;
}

export function FileList({ files, onRemove, onClearAll, disabled = false }: FileListProps) {
  const [filterQuery, setFilterQuery] = useState("");

  const totalBytes = useMemo(() => {
    return files.reduce((acc, f) => acc + (f.size || 0), 0);
  }, [files]);

  const filteredFiles = useMemo(() => {
    if (!filterQuery.trim()) return files;
    const q = filterQuery.toLowerCase();
    return files.filter(
      (f) => f.relativePath.toLowerCase().includes(q) || f.file.name.toLowerCase().includes(q)
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:px-6 sm:py-4 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Selected Entries</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
                {files.length} {files.length === 1 ? "file" : "files"}
              </span>
              {directoryCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {directoryCount} {directoryCount === 1 ? "folder" : "folders"}
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-400">Total uncompressed: {formatBytes(totalBytes)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {files.length > 6 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter files..."
                className="w-36 sm:w-48 pl-8 pr-3 py-1 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/20 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>
      </div>

      {/* List items */}
      <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/60">
        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No files matched &ldquo;{filterQuery}&rdquo;
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
                className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 hover:bg-zinc-800/30 transition-colors group text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    {getFileIcon(item.relativePath, item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate flex items-center gap-1.5 font-mono">
                      {hasDirectory && (
                        <span className="text-zinc-500 font-normal truncate">
                          {dirPrefix}/
                        </span>
                      )}
                      <span className="text-zinc-200 font-medium">{fileName}</span>
                    </div>

                    {item.isDuplicate && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 mt-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        Disambiguated duplicate path
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-zinc-400 font-mono text-[11px]">
                    {formatBytes(item.size)}
                  </span>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRemove(item.id)}
                    title={`Remove ${item.relativePath}`}
                    className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-70 group-hover:opacity-100 disabled:opacity-30"
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
