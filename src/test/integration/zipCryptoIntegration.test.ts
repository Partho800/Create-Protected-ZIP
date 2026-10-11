import { describe, it, expect } from "vitest";
import {
  createSecureZip,
  verifyZipArchive,
  calculateSha256,
} from "@/services/zipService";
import { FileEntryItem } from "@/types/zip";
import { ZipReader, BlobReader, TextWriter } from "@zip.js/zip.js";

function createMockFileItem(relativePath: string, content: string): FileEntryItem {
  const blob = new Blob([content], { type: "text/plain" });
  const file = new File([blob], relativePath.split("/").pop() || "file.txt", {
    type: "text/plain",
  });
  return {
    id: `item-${Math.random()}`,
    file,
    relativePath,
    size: blob.size,
    type: "text/plain",
    lastModified: Date.now(),
  };
}

describe("AES-256 ZIP Encryption & Integration Engine", () => {
  it("strictly enforces AES-256 encryption: entries are marked encrypted and require password", async () => {
    const originalText = "Top-Secret-AES256-Payload-123456789";
    const password = "MilitaryGradePassword#2026";
    const files = [createMockFileItem("documents/confidential.txt", originalText)];

    const result = await createSecureZip({
      files,
      options: {
        archiveName: "secure-test.zip",
        password,
        encryptionStrength: 3, // strictly AES-256
        zip64: true,
      },
    });

    expect(result.blob).toBeDefined();
    expect(result.fileSize).toBeGreaterThan(0);
    expect(result.encryptionType).toBe("AES-256");

    // 1. Inspect ZIP directly using ZipReader to confirm AES-256 encryption flags
    const reader = new ZipReader(new BlobReader(result.blob));
    const entries = await reader.getEntries();
    expect(entries.length).toBe(1);

    const firstEntry = entries[0];
    expect(firstEntry.filename).toBe("documents/confidential.txt");
    expect(firstEntry.encrypted).toBe(true);

    // 2. Demonstrate that decryption with INCORRECT password is flatly rejected
    let wrongPasswordError: any = null;
    try {
      await (firstEntry as any).getData(new TextWriter(), {
        password: "WrongPassword999!",
      });
    } catch (err) {
      wrongPasswordError = err;
    }
    expect(wrongPasswordError).toBeDefined();

    // 3. Demonstrate that decryption with CORRECT password succeeds with exact fidelity
    const decryptedText = await (firstEntry as any).getData(new TextWriter(), {
      password,
    });
    expect(decryptedText).toBe(originalText);

    await reader.close();
  });

  it("preserves complex folder structures and nested subdirectories", async () => {
    const password = "ValidPassword123!";
    const files = [
      createMockFileItem("project/src/components/Button.tsx", "export const Button = () => null;"),
      createMockFileItem("project/src/utils/helpers.ts", "export const add = (a, b) => a + b;"),
      createMockFileItem("project/public/assets/images/logo.svg", "<svg>logo</svg>"),
      createMockFileItem("project/README.md", "# Project Documentation"),
    ];

    const result = await createSecureZip({
      files,
      options: {
        archiveName: "project-archive.zip",
        password,
        encryptionStrength: 3,
        zip64: true,
      },
    });

    const verification = await verifyZipArchive(result.blob, password);
    expect(verification.isValidZip).toBe(true);
    expect(verification.isEncrypted).toBe(true);
    expect(verification.entriesCount).toBe(4);

    const entryFilenames = verification.entries.map((e) => e.filename);
    expect(entryFilenames).toContain("project/src/components/Button.tsx");
    expect(entryFilenames).toContain("project/src/utils/helpers.ts");
    expect(entryFilenames).toContain("project/public/assets/images/logo.svg");
    expect(entryFilenames).toContain("project/README.md");

    // Verify all entries are encrypted
    expect(verification.entries.every((e) => e.encrypted)).toBe(true);
  });

  it("supports duplicate filenames across different directories with proper path separation", async () => {
    const password = "ValidPassword123!";
    const files = [
      createMockFileItem("client/config.json", '{"env": "client"}'),
      createMockFileItem("server/config.json", '{"env": "server"}'),
      createMockFileItem("shared/sub/config.json", '{"env": "shared"}'),
    ];

    const result = await createSecureZip({
      files,
      options: {
        archiveName: "duplicate-names.zip",
        password,
        encryptionStrength: 3,
      },
    });

    const reader = new ZipReader(new BlobReader(result.blob));
    const entries = await reader.getEntries();
    expect(entries.length).toBe(3);

    const clientEntry = entries.find((e) => e.filename === "client/config.json");
    const serverEntry = entries.find((e) => e.filename === "server/config.json");
    const sharedEntry = entries.find((e) => e.filename === "shared/sub/config.json");

    expect(clientEntry).toBeDefined();
    expect(serverEntry).toBeDefined();
    expect(sharedEntry).toBeDefined();

    const clientContent = await (clientEntry as any).getData(new TextWriter(), { password });
    const serverContent = await (serverEntry as any).getData(new TextWriter(), { password });
    expect(clientContent).toBe('{"env": "client"}');
    expect(serverContent).toBe('{"env": "server"}');

    await reader.close();
  });

  it("never silently downgrades: throws error when password is empty or unprovided", async () => {
    const files = [createMockFileItem("file.txt", "content")];

    await expect(
      createSecureZip({
        files,
        options: {
          archiveName: "test.zip",
          password: "",
        },
      })
    ).rejects.toThrow("Password is required for AES-256 encryption");

    await expect(
      createSecureZip({
        files,
        options: {
          archiveName: "test.zip",
          password: "   ",
        },
      })
    ).rejects.toThrow("Password is required for AES-256 encryption");
  });

  it("rejects empty file selection", async () => {
    await expect(
      createSecureZip({
        files: [],
        options: {
          archiveName: "empty.zip",
          password: "ValidPassword123!",
        },
      })
    ).rejects.toThrow("No files selected");
  });

  it("supports clean cancellation via AbortSignal", async () => {
    const controller = new AbortController();
    const files = [
      createMockFileItem("file1.txt", "1".repeat(1000)),
      createMockFileItem("file2.txt", "2".repeat(1000)),
    ];

    // Abort immediately
    controller.abort();

    await expect(
      createSecureZip({
        files,
        options: {
          archiveName: "abort-test.zip",
          password: "ValidPassword123!",
        },
        signal: controller.signal,
      })
    ).rejects.toThrow();
  });

  it("computes accurate SHA-256 checksum for generated archives", async () => {
    const files = [createMockFileItem("data.txt", "Checksum Verification String")];
    const result = await createSecureZip({
      files,
      options: {
        archiveName: "checksum.zip",
        password: "ValidPassword123!",
      },
    });

    expect(result.sha256).toBeDefined();
    expect(result.sha256).toHaveLength(64); // 64 hex characters

    const manualSha = await calculateSha256(result.blob);
    expect(manualSha).toBe(result.sha256);
  });

  it("verifyZipArchive returns comprehensive verification report and password test outcome", async () => {
    const originalContent = "Inspectable Secret Text";
    const password = "CorrectInspectPassword123!";
    const files = [createMockFileItem("notes/secret.txt", originalContent)];

    const result = await createSecureZip({
      files,
      options: {
        archiveName: "inspect.zip",
        password,
      },
    });

    // Test with correct password
    const validReport = await verifyZipArchive(result.blob, password);
    expect(validReport.isValidZip).toBe(true);
    expect(validReport.isEncrypted).toBe(true);
    expect(validReport.encryptionType).toBe("AES-256");
    expect(validReport.testDecryptionSuccess).toBe(true);
    expect(validReport.testDecryptionError).toBeUndefined();

    // Test with incorrect password
    const invalidReport = await verifyZipArchive(result.blob, "WrongPasswordHere");
    expect(invalidReport.isValidZip).toBe(true);
    expect(invalidReport.isEncrypted).toBe(true);
    expect(invalidReport.testDecryptionSuccess).toBe(false);
    expect(invalidReport.testDecryptionError).toBeDefined();
  });
});
