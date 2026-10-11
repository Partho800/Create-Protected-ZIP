import { describe, it, expect } from "vitest";
import {
  normalizeRelativePath,
  sanitizeArchiveName,
  deriveArchiveName,
  formatBytes,
  deduplicateRelativePaths,
} from "@/services/fileScanner";
import { FileEntryItem } from "@/types/zip";

describe("File Scanner & Normalization Service", () => {
  describe("normalizeRelativePath", () => {
    it("should convert Windows backslashes to forward slashes", () => {
      expect(normalizeRelativePath("folder\\subfolder\\file.txt")).toBe("folder/subfolder/file.txt");
    });

    it("should remove leading ./ and slashes", () => {
      expect(normalizeRelativePath("./docs/report.pdf")).toBe("docs/report.pdf");
      expect(normalizeRelativePath("/root/data.csv")).toBe("root/data.csv");
      expect(normalizeRelativePath("///deep///nested//path.txt")).toBe("deep/nested/path.txt");
    });

    it("should fallback to 'file' for empty input", () => {
      expect(normalizeRelativePath("")).toBe("file");
    });
  });

  describe("sanitizeArchiveName", () => {
    it("should ensure .zip extension is present", () => {
      expect(sanitizeArchiveName("my-vault")).toBe("my-vault.zip");
      expect(sanitizeArchiveName("my-vault.zip")).toBe("my-vault.zip");
      expect(sanitizeArchiveName("my-vault.ZIP")).toBe("my-vault.ZIP");
    });

    it("should strip invalid characters", () => {
      expect(sanitizeArchiveName("archive:test*file?name.zip")).toBe("archive_test_file_name.zip");
    });

    it("should provide default when empty", () => {
      expect(sanitizeArchiveName("")).toBe("secure-archive.zip");
    });
  });

  describe("deriveArchiveName", () => {
    it("should auto-name archive after common root folder", () => {
      const items: FileEntryItem[] = [
        {
          id: "1",
          file: new File(["hello"], "index.ts"),
          relativePath: "AwesomeProject/src/index.ts",
          size: 10,
          type: "text/plain",
          lastModified: Date.now(),
        },
        {
          id: "2",
          file: new File(["pkg"], "package.json"),
          relativePath: "AwesomeProject/package.json",
          size: 20,
          type: "application/json",
          lastModified: Date.now(),
        },
      ];

      expect(deriveArchiveName(items)).toBe("AwesomeProject.zip");
    });

    it("should auto-name archive after uploaded single file", () => {
      const items: FileEntryItem[] = [
        {
          id: "1",
          file: new File(["data"], "FinancialReport.pdf"),
          relativePath: "FinancialReport.pdf",
          size: 100,
          type: "application/pdf",
          lastModified: Date.now(),
        },
      ];

      expect(deriveArchiveName(items)).toBe("FinancialReport.zip");
    });

    it("should fallback to secure-archive.zip when list is empty", () => {
      expect(deriveArchiveName([])).toBe("secure-archive.zip");
    });
  });

  describe("formatBytes", () => {
    it("should format 0 bytes", () => {
      expect(formatBytes(0)).toBe("0 B");
    });

    it("should format bytes, KB, MB, and GB accurately", () => {
      expect(formatBytes(512)).toBe("512 B");
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1048576)).toBe("1 MB");
      expect(formatBytes(1073741824)).toBe("1 GB");
      expect(formatBytes(2500000)).toBe("2.38 MB");
    });
  });

  describe("deduplicateRelativePaths", () => {
    const createMockItem = (id: string, relativePath: string): FileEntryItem => ({
      id,
      file: new File(["content"], relativePath.split("/").pop() || "file.txt"),
      relativePath,
      size: 10,
      type: "text/plain",
      lastModified: Date.now(),
    });

    it("should preserve different directory paths with identical filenames", () => {
      const items: FileEntryItem[] = [
        createMockItem("1", "src/index.ts"),
        createMockItem("2", "dist/index.ts"),
        createMockItem("3", "index.ts"),
      ];

      const result = deduplicateRelativePaths(items);
      expect(result).toHaveLength(3);
      expect(result[0].relativePath).toBe("src/index.ts");
      expect(result[1].relativePath).toBe("dist/index.ts");
      expect(result[2].relativePath).toBe("index.ts");
      expect(result.every((r) => !r.isDuplicate)).toBe(true);
    });

    it("should disambiguate exact collision relative paths with numbering", () => {
      const items: FileEntryItem[] = [
        createMockItem("1", "photos/vacation.jpg"),
        createMockItem("2", "photos/vacation.jpg"),
        createMockItem("3", "photos/vacation.jpg"),
      ];

      const result = deduplicateRelativePaths(items);
      expect(result[0].relativePath).toBe("photos/vacation.jpg");
      expect(result[0].isDuplicate).toBe(false);

      expect(result[1].relativePath).toBe("photos/vacation (1).jpg");
      expect(result[1].isDuplicate).toBe(true);

      expect(result[2].relativePath).toBe("photos/vacation (2).jpg");
      expect(result[2].isDuplicate).toBe(true);
    });
  });
});
