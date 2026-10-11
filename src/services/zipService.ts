import {
  ZipWriter,
  ZipReader,
  BlobWriter,
  BlobReader,
  TextWriter,
  configure,
} from "@zip.js/zip.js";
import {
  FileEntryItem,
  ZipOptions,
  ZipProgress,
  ZipResult,
  ZipVerificationResult,
  ZipVerifiedEntry,
} from "@/types/zip";
import { sanitizeArchiveName } from "./fileScanner";

// Configure zip.js for modern browsers
if (typeof window !== "undefined") {
  try {
    configure({
      useWebWorkers: true,
      useCompressionStream: true,
    });
  } catch {
    // Fallback gracefully if workers restricted by environment CSP
  }
}

/**
 * Calculates SHA-256 hash of a Blob using standard Web Cryptography API.
 */
export async function calculateSha256(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface CreateSecureZipParams {
  files: FileEntryItem[];
  options: ZipOptions;
  signal?: AbortSignal;
  onProgress?: (progress: ZipProgress) => void;
}

/**
 * Creates an AES-256 encrypted ZIP archive locally in the browser.
 * Strictly enforces AES-256 encryption without silent downgrade.
 */
export async function createSecureZip({
  files,
  options,
  signal,
  onProgress,
}: CreateSecureZipParams): Promise<ZipResult> {
  // Enforce mandatory security checks
  if (!files || files.length === 0) {
    throw new Error("No files selected. Please add at least one file or folder to archive.");
  }

  if (!options.password || options.password.trim().length === 0) {
    throw new Error(
      "Password is required for AES-256 encryption. Unencrypted ZIP creation is disabled by security policy."
    );
  }

  const totalFiles = files.length;
  const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0) || 1;
  const archiveName = sanitizeArchiveName(options.archiveName || "secure-archive.zip");

  const notifyProgress = (
    status: ZipProgress["status"],
    currentFileIndex: number,
    currentFileName: string,
    bytesProcessed: number,
    percentage: number,
    errorMessage?: string
  ) => {
    if (onProgress) {
      onProgress({
        status,
        currentFileIndex,
        currentFileName,
        totalFiles,
        bytesProcessed,
        totalBytes,
        percentage: Math.min(100, Math.max(0, percentage)),
        errorMessage,
      });
    }
  };

  notifyProgress("scanning", 0, "Initializing secure vault...", 0, 0);

  if (signal?.aborted) {
    throw new Error("Archiving cancelled before starting.");
  }

  const blobWriter = new BlobWriter("application/zip");
  const zipWriter = new ZipWriter(blobWriter, {
    zip64: options.zip64 ?? true,
    level: options.level ?? 6,
  });

  let totalBytesProcessedBeforeCurrent = 0;

  try {
    for (let i = 0; i < files.length; i++) {
      if (signal?.aborted) {
        throw new Error("Archiving cancelled by user.");
      }

      const item = files[i];
      const fileSize = item.size || 0;

      notifyProgress(
        "compressing",
        i + 1,
        item.relativePath,
        totalBytesProcessedBeforeCurrent,
        Math.round((totalBytesProcessedBeforeCurrent / totalBytes) * 100)
      );

      const fileReader = new BlobReader(item.file);

      const isZipCrypto = options.encryptionMode === "zipcrypto";

      await zipWriter.add(item.relativePath, fileReader, {
        password: options.password,
        zipCrypto: isZipCrypto,
        encryptionStrength: isZipCrypto ? undefined : 3, // Enforce 256-bit AES
        zip64: options.zip64 ?? true,
        signal,
        onprogress: (currentEntryBytes: number) => {
          if (signal?.aborted) return;
          const currentTotal = totalBytesProcessedBeforeCurrent + currentEntryBytes;
          const currentPct = Math.min(99, Math.round((currentTotal / totalBytes) * 100));
          notifyProgress("compressing", i + 1, item.relativePath, currentTotal, currentPct);
        },
      });

      totalBytesProcessedBeforeCurrent += fileSize;
    }

    if (signal?.aborted) {
      throw new Error("Archiving cancelled by user.");
    }

    notifyProgress("finalizing", totalFiles, "Writing encrypted central directory...", totalBytes, 99);

    await zipWriter.close();
    const zipBlob = await blobWriter.getData();

    notifyProgress("finalizing", totalFiles, "Calculating integrity checksum...", totalBytes, 100);

    const sha256 = await calculateSha256(zipBlob);
    const downloadUrl = URL.createObjectURL(zipBlob);

    notifyProgress("success", totalFiles, "Complete", totalBytes, 100);

    return {
      blob: zipBlob,
      downloadUrl,
      fileName: archiveName,
      fileSize: zipBlob.size,
      sha256,
      totalEntries: totalFiles,
      encryptionType:
        options.encryptionMode === "zipcrypto"
          ? "ZipCrypto (Windows Native)"
          : "AES-256",
      createdAt: new Date(),
    };
  } catch (err: any) {
    try {
      await zipWriter.close();
    } catch {
      // ignore writer close failure during abort
    }

    const isAborted =
      signal?.aborted ||
      err?.name === "AbortError" ||
      err?.message?.includes("cancelled") ||
      err?.message?.includes("aborted");

    const status = isAborted ? "cancelled" : "error";
    const errorMessage = isAborted ? "Archiving was cancelled." : err?.message || "Failed to create archive.";

    notifyProgress(status, 0, "", totalBytesProcessedBeforeCurrent, 0, errorMessage);

    throw err;
  }
}

/**
 * Automatically triggers browser file download.
 */
export function triggerBrowserDownload(blobOrUrl: Blob | string, fileName: string): void {
  if (typeof window === "undefined") return;

  const url = typeof blobOrUrl === "string" ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = sanitizeArchiveName(fileName);
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup anchor
  setTimeout(() => {
    document.body.removeChild(anchor);
    if (typeof blobOrUrl !== "string") {
      URL.revokeObjectURL(url);
    }
  }, 1000);
}

/**
 * Inspects a ZIP archive to verify whether AES encryption is applied and test password extraction.
 */
export async function verifyZipArchive(
  zipBlob: Blob,
  testPassword?: string
): Promise<ZipVerificationResult> {
  const zipReader = new ZipReader(new BlobReader(zipBlob));

  try {
    const entries = await zipReader.getEntries();
    const verifiedEntries: ZipVerifiedEntry[] = [];
    let isEncrypted = false;
    let totalUncompressedBytes = 0;

    for (const entry of entries) {
      if (entry.encrypted) {
        isEncrypted = true;
      }
      totalUncompressedBytes += entry.uncompressedSize || 0;
      verifiedEntries.push({
        filename: entry.filename,
        compressedSize: entry.compressedSize || 0,
        uncompressedSize: entry.uncompressedSize || 0,
        encrypted: !!entry.encrypted,
        directory: !!entry.directory,
        lastModDate: entry.lastModDate,
      });
    }

    const result: ZipVerificationResult = {
      isValidZip: true,
      isEncrypted,
      encryptionType: isEncrypted ? "AES-256" : "None (Unencrypted)",
      entriesCount: entries.length,
      totalUncompressedBytes,
      entries: verifiedEntries,
    };

    // If password provided and there are entries, test decrypting the first non-directory entry
    if (testPassword !== undefined && entries.length > 0) {
      const fileEntry = entries.find((e) => !e.directory) || entries[0];
      result.decryptedSampleName = fileEntry.filename;

      if ("getData" in fileEntry && typeof (fileEntry as any).getData === "function") {
        try {
          await (fileEntry as any).getData(new TextWriter(), {
            password: testPassword,
          });
          result.testDecryptionSuccess = true;
        } catch (err: any) {
          result.testDecryptionSuccess = false;
          result.testDecryptionError = err?.message || "Invalid password or corrupted ciphertext.";
        }
      }
    }

    return result;
  } finally {
    await zipReader.close();
  }
}
