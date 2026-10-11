"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  FileEntryItem,
  ZipProgress,
  ZipResult,
  ZipVerificationResult,
} from "@/types/zip";
import {
  createSecureZip,
  triggerBrowserDownload,
  verifyZipArchive,
} from "@/services/zipService";
import {
  deduplicateRelativePaths,
  sanitizeArchiveName,
  deriveArchiveName,
} from "@/services/fileScanner";
import { validatePasswordMatch } from "@/services/passwordStrength";

const INITIAL_PROGRESS: ZipProgress = {
  status: "idle",
  currentFileName: "",
  currentFileIndex: 0,
  totalFiles: 0,
  bytesProcessed: 0,
  totalBytes: 0,
  percentage: 0,
};

export function useSecureZip() {
  const [files, setFiles] = useState<FileEntryItem[]>([]);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [archiveName, setArchiveName] = useState<string>("secure-archive.zip");
  const [zip64, setZip64] = useState<boolean>(true);
  const [compressionLevel, setCompressionLevel] = useState<number>(9); // High power (Maximum Deflate level 9)
  const [encryptionMode, setEncryptionMode] = useState<"aes-256" | "zipcrypto">("zipcrypto");

  const [progress, setProgress] = useState<ZipProgress>(INITIAL_PROGRESS);
  const [result, setResult] = useState<ZipResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [verificationResult, setVerificationResult] =
    useState<ZipVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const activeBlobUrlRef = useRef<string | null>(null);

  // Clean up object URLs when unmounting
  useEffect(() => {
    return () => {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
      }
    };
  }, []);

  const addFiles = useCallback((newItems: FileEntryItem[]) => {
    setError(null);
    setFiles((prev) => {
      const combined = deduplicateRelativePaths([...prev, ...newItems]);
      const autoName = deriveArchiveName(combined);
      setArchiveName(autoName);
      return combined;
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const remaining = prev.filter((item) => item.id !== id);
      setArchiveName(deriveArchiveName(remaining));
      return remaining;
    });
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setArchiveName("secure-archive.zip");
    setError(null);
  }, []);

  const resetAll = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    setFiles([]);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setEncryptionMode("zipcrypto");
    setArchiveName("secure-archive.zip");
    setProgress(INITIAL_PROGRESS);
    setResult(null);
    setError(null);
    setIsGenerating(false);
    setVerificationResult(null);
  }, []);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setProgress((prev) => ({
      ...prev,
      status: "cancelled",
      errorMessage: "Archive creation was cancelled.",
    }));
  }, []);

  const generateZip = useCallback(async () => {
    setError(null);

    if (files.length === 0) {
      setError("Please add at least one file or folder to encrypt.");
      return null;
    }

    const validation = validatePasswordMatch(password, confirmPassword);
    if (!validation.isValid) {
      setError(validation.error || "Password validation failed.");
      return null;
    }

    // Cancel any previous run
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Revoke previous URL to avoid memory leaks
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }

    setIsGenerating(true);
    setProgress({
      status: "scanning",
      currentFileName: "Initializing AES-256 engine...",
      currentFileIndex: 0,
      totalFiles: files.length,
      bytesProcessed: 0,
      totalBytes: files.reduce((acc, f) => acc + f.size, 0),
      percentage: 0,
    });

    try {
      const generated = await createSecureZip({
        files,
        options: {
          archiveName: sanitizeArchiveName(archiveName),
          password,
          encryptionStrength: 3,
          encryptionMode,
          zip64,
          level: compressionLevel,
        },
        signal: controller.signal,
        onProgress: (p) => {
          setProgress(p);
        },
      });

      activeBlobUrlRef.current = generated.downloadUrl;
      setResult(generated);
      setIsGenerating(false);

      // Automatically initiate download after successful archive generation
      triggerBrowserDownload(generated.blob, generated.fileName);

      // Trigger celebration confetti
      if (typeof window !== "undefined") {
        import("canvas-confetti").then((confettiModule) => {
          const confetti = confettiModule.default;
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }).catch(() => {});
      }

      return generated;
    } catch (err: any) {
      if (controller.signal.aborted) {
        setIsGenerating(false);
        return null;
      }
      setIsGenerating(false);
      const msg = err?.message || "Failed to create secure archive.";
      setError(msg);
      setProgress((prev) => ({
        ...prev,
        status: "error",
        errorMessage: msg,
      }));
      return null;
    }
  }, [files, password, confirmPassword, archiveName, zip64, compressionLevel]);

  const verifyArchive = useCallback(
    async (blobToVerify?: Blob, testPassword?: string) => {
      const targetBlob = blobToVerify || result?.blob;
      if (!targetBlob) {
        setError("No archive available to verify.");
        return null;
      }

      setIsVerifying(true);
      try {
        const vResult = await verifyZipArchive(targetBlob, testPassword ?? password);
        setVerificationResult(vResult);
        setIsVerifying(false);
        return vResult;
      } catch (err: any) {
        setIsVerifying(false);
        const vResult: ZipVerificationResult = {
          isValidZip: false,
          isEncrypted: false,
          encryptionType: "Unknown",
          entriesCount: 0,
          totalUncompressedBytes: 0,
          entries: [],
          testDecryptionSuccess: false,
          testDecryptionError: err?.message || "Failed to read zip archive.",
        };
        setVerificationResult(vResult);
        return vResult;
      }
    },
    [result, password]
  );

  return {
    files,
    password,
    confirmPassword,
    showPassword,
    archiveName,
    encryptionMode,
    zip64,
    compressionLevel,
    progress,
    result,
    error,
    isGenerating,
    verificationResult,
    isVerifying,
    addFiles,
    removeFile,
    clearFiles,
    setPassword,
    setConfirmPassword,
    setShowPassword,
    setEncryptionMode,
    setArchiveName,
    setZip64,
    setCompressionLevel,
    generateZip,
    cancelGeneration,
    resetAll,
    verifyArchive,
  };
}
