import { FileEntryItem } from "@/types/zip";

/**
 * Normalizes relative file paths, replacing Windows backslashes with standard forward slashes,
 * stripping leading slashes or dots, and trimming whitespace.
 */
export function normalizeRelativePath(path: string): string {
  if (!path) return "file";
  let normalized = path.replace(/\\/g, "/");
  // Remove leading slashes and dot-slashes
  normalized = normalized.replace(/^(\.\/|\/)+/, "");
  // Collapse multiple slashes
  normalized = normalized.replace(/\/+/g, "/");
  return normalized.trim();
}

/**
 * Sanitizes archive name ensuring it ends with .zip and contains no prohibited filesystem characters.
 */
export function sanitizeArchiveName(name: string): string {
  let cleaned = (name || "secure-archive")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, " ");

  if (!cleaned.toLowerCase().endsWith(".zip")) {
    cleaned = `${cleaned}.zip`;
  }
  return cleaned || "secure-archive.zip";
}

/**
 * Automatically derives the ZIP archive filename from the uploaded folder or file.
 * If all files share a common root directory, that folder name is used.
 * Otherwise, the first file's name (without original extension) is used.
 */
export function deriveArchiveName(files: FileEntryItem[]): string {
  if (!files || files.length === 0) return "secure-archive.zip";

  // Check if entries share a common root directory (e.g. MyFolder/file.txt)
  const firstPath = files[0].relativePath;
  const firstParts = firstPath.split("/");

  if (firstParts.length > 1) {
    const commonRoot = firstParts[0];
    const allShareRoot = files.every(
      (f) => f.relativePath === commonRoot || f.relativePath.startsWith(`${commonRoot}/`)
    );
    if (allShareRoot && commonRoot.trim()) {
      return sanitizeArchiveName(commonRoot);
    }
  }

  // If single file or multiple loose files, use first file's base name
  const firstFileName = files[0].file?.name || firstParts[firstParts.length - 1];
  const lastDot = firstFileName.lastIndexOf(".");
  const baseName = lastDot > 0 ? firstFileName.substring(0, lastDot) : firstFileName;

  return sanitizeArchiveName(baseName || "secure-archive");
}


/**
 * Formats byte counts into human-readable strings (e.g. 1.25 MB).
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 B";
  if (bytes < 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unitIndex = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, unitIndex)).toFixed(dm))} ${sizes[unitIndex]}`;
}

/**
 * Generates a unique collision-free relative path for entries that would otherwise collide.
 */
export function deduplicateRelativePaths(items: FileEntryItem[]): FileEntryItem[] {
  const seenPaths = new Map<string, number>();

  return items.map((item) => {
    const rawPath = normalizeRelativePath(item.relativePath);
    if (!seenPaths.has(rawPath)) {
      seenPaths.set(rawPath, 1);
      return {
        ...item,
        relativePath: rawPath,
        isDuplicate: false,
      };
    }

    // Name collision detected: create a disambiguated path
    const count = seenPaths.get(rawPath)!;
    seenPaths.set(rawPath, count + 1);

    const lastSlash = rawPath.lastIndexOf("/");
    const dir = lastSlash >= 0 ? rawPath.substring(0, lastSlash + 1) : "";
    const filename = lastSlash >= 0 ? rawPath.substring(lastSlash + 1) : rawPath;

    const lastDot = filename.lastIndexOf(".");
    const base = lastDot > 0 ? filename.substring(0, lastDot) : filename;
    const ext = lastDot > 0 ? filename.substring(lastDot) : "";

    const disambiguatedPath = `${dir}${base} (${count})${ext}`;

    return {
      ...item,
      relativePath: disambiguatedPath,
      isDuplicate: true,
    };
  });
}

/**
 * Recursively scans entries from HTML5 drag and drop FileSystemEntry objects.
 */
export async function scanFileSystemEntry(
  entry: any,
  basePath: string = ""
): Promise<FileEntryItem[]> {
  const results: FileEntryItem[] = [];

  if (entry.isFile) {
    const file: File = await new Promise((resolve, reject) => {
      entry.file(resolve, reject);
    });
    const relativePath = normalizeRelativePath(basePath ? `${basePath}/${file.name}` : file.name);
    results.push({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      relativePath,
      size: file.size,
      type: file.type || "application/octet-stream",
      lastModified: file.lastModified,
    });
  } else if (entry.isDirectory) {
    const dirReader = entry.createReader();
    const currentDirPath = basePath ? `${basePath}/${entry.name}` : entry.name;

    const readEntries = async (): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        dirReader.readEntries(resolve, reject);
      });
    };

    let entries: any[] = [];
    let batch: any[] = [];
    do {
      batch = await readEntries();
      entries = entries.concat(batch);
    } while (batch.length > 0);

    for (const childEntry of entries) {
      const childResults = await scanFileSystemEntry(childEntry, currentDirPath);
      results.push(...childResults);
    }
  }

  return results;
}

/**
 * Processes dragged items or files from DataTransfer.
 */
export async function processDataTransfer(
  dataTransfer: DataTransfer
): Promise<FileEntryItem[]> {
  const items: FileEntryItem[] = [];

  // Check if modern webkitGetAsEntry is available for directory traversal
  const dtItems = dataTransfer.items;
  let supportsDirectoryScanning = false;

  if (dtItems && dtItems.length > 0) {
    for (let i = 0; i < dtItems.length; i++) {
      const item = dtItems[i];
      if (typeof item.webkitGetAsEntry === "function") {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          supportsDirectoryScanning = true;
          const scanned = await scanFileSystemEntry(entry);
          items.push(...scanned);
        }
      }
    }
  }

  // Fallback to plain files if webkitGetAsEntry was not usable or yielded nothing
  if (!supportsDirectoryScanning && dataTransfer.files) {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i];
      const relativePath = (file as any).webkitRelativePath
        ? normalizeRelativePath((file as any).webkitRelativePath)
        : normalizeRelativePath(file.name);

      items.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        relativePath,
        size: file.size,
        type: file.type || "application/octet-stream",
        lastModified: file.lastModified,
      });
    }
  }

  return deduplicateRelativePaths(items);
}

/**
 * Processes files selected via `<input type="file" multiple>` or folder picker `<input webkitdirectory>`.
 */
export function processFileInput(fileList: FileList): FileEntryItem[] {
  const items: FileEntryItem[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const rawPath = (file as any).webkitRelativePath || file.name;
    const relativePath = normalizeRelativePath(rawPath);

    items.push({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      relativePath,
      size: file.size,
      type: file.type || "application/octet-stream",
      lastModified: file.lastModified,
    });
  }

  return deduplicateRelativePaths(items);
}
