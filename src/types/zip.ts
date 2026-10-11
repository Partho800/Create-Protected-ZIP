export interface FileEntryItem {
  id: string;
  file: File;
  relativePath: string;
  size: number;
  type: string;
  lastModified: number;
  isDuplicate?: boolean;
}

export type EncryptionStrength = 1 | 2 | 3; // 1 = AES-128, 2 = AES-192, 3 = AES-256
export type EncryptionMode = "aes-256" | "zipcrypto";

export interface ZipOptions {
  archiveName: string;
  password: string;
  encryptionStrength?: EncryptionStrength; // Default 3 (AES-256)
  encryptionMode?: EncryptionMode; // "aes-256" or "zipcrypto"
  zip64?: boolean;
  level?: number; // 0 (Store) to 9 (Best)
}

export type ZipStatus =
  | "idle"
  | "scanning"
  | "compressing"
  | "finalizing"
  | "success"
  | "error"
  | "cancelled";

export interface ZipProgress {
  status: ZipStatus;
  currentFileName: string;
  currentFileIndex: number;
  totalFiles: number;
  bytesProcessed: number;
  totalBytes: number;
  percentage: number;
  errorMessage?: string;
}

export interface ZipResult {
  blob: Blob;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  sha256: string;
  totalEntries: number;
  encryptionType: string;
  createdAt: Date;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  color: string;
  feedback: string[];
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export interface ZipVerifiedEntry {
  filename: string;
  compressedSize: number;
  uncompressedSize: number;
  encrypted: boolean;
  directory: boolean;
  lastModDate?: Date;
}

export interface ZipVerificationResult {
  isValidZip: boolean;
  isEncrypted: boolean;
  encryptionType: string;
  entriesCount: number;
  totalUncompressedBytes: number;
  entries: ZipVerifiedEntry[];
  testDecryptionSuccess?: boolean;
  testDecryptionError?: string;
  decryptedSampleName?: string;
}
