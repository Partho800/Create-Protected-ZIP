import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { VerifyModal } from "@/components/VerifyModal";
import * as zipService from "@/services/zipService";

vi.mock("@/services/zipService", () => ({
  verifyZipArchive: vi.fn(),
  extractZipEntry: vi.fn(),
  triggerBrowserDownload: vi.fn(),
  sanitizeArchiveName: (n: string) => n,
}));

describe("VerifyModal File-Locking & State-Management Suite", () => {
  const mockBlob = new Blob(["fake-zip-data"], { type: "application/zip" });
  const mockCurrentResult = {
    blob: mockBlob,
    fileName: "secret-archive.zip",
    fileSize: 1024,
    totalEntries: 2,
    sha256: "abc123hash",
    downloadUrl: "blob:http://localhost:3000/mock",
    encryptionType: "AES-256" as const,
    createdAt: new Date(),
  };


  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("always opens in the locked state and requires password", () => {
    render(
      <VerifyModal
        isOpen={true}
        onClose={vi.fn()}
        currentResult={mockCurrentResult}
      />
    );

    expect(screen.getByText(/Locked Secure Archive/i)).toBeInTheDocument();
    expect(screen.getByText(/Archive Contents Are Locked/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter password to unlock/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Unlocked Files & Directory Contents/i)
    ).not.toBeInTheDocument();
  });

  it("unlocks archive only upon entering the correct password", async () => {
    vi.mocked(zipService.verifyZipArchive).mockResolvedValueOnce({
      isValidZip: true,
      isEncrypted: true,
      encryptionType: "AES-256",
      entriesCount: 2,
      totalUncompressedBytes: 2048,
      testDecryptionSuccess: true,
      entries: [
        {
          filename: "confidential.txt",
          compressedSize: 50,
          uncompressedSize: 100,
          encrypted: true,
          directory: false,
        },
        {
          filename: "photos/diagram.png",
          compressedSize: 500,
          uncompressedSize: 1948,
          encrypted: true,
          directory: false,
        },
      ],
    });

    render(
      <VerifyModal
        isOpen={true}
        onClose={vi.fn()}
        currentResult={mockCurrentResult}
      />
    );

    const passwordInput = screen.getByPlaceholderText(/Enter password to unlock/i);
    const unlockBtn = screen.getByRole("button", { name: /Unlock Archive/i });

    fireEvent.change(passwordInput, { target: { value: "SuperSecretPass!1" } });
    fireEvent.click(unlockBtn);

    await waitFor(() => {
      expect(screen.getByText(/Decryption Verified & Unlocked!/i)).toBeInTheDocument();
      expect(screen.getByText("confidential.txt")).toBeInTheDocument();
      expect(screen.getByText("photos/diagram.png")).toBeInTheDocument();
    });
  });

  it("relocks immediately when the user clicks 'Lock Archive'", async () => {
    vi.mocked(zipService.verifyZipArchive).mockResolvedValueOnce({
      isValidZip: true,
      isEncrypted: true,
      encryptionType: "AES-256",
      entriesCount: 1,
      totalUncompressedBytes: 100,
      testDecryptionSuccess: true,
      entries: [
        {
          filename: "notes.txt",
          compressedSize: 50,
          uncompressedSize: 100,
          encrypted: true,
          directory: false,
        },
      ],
    });

    render(
      <VerifyModal
        isOpen={true}
        onClose={vi.fn()}
        currentResult={mockCurrentResult}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter password to unlock/i), {
      target: { value: "SecretPass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Unlock Archive/i }));

    await waitFor(() => {
      expect(screen.getByText(/Decryption Verified & Unlocked!/i)).toBeInTheDocument();
    });

    // Click Lock Archive
    const lockBtn = screen.getByTitle(/Lock archive now/i);
    fireEvent.click(lockBtn);

    // Must return to locked state
    expect(screen.getByText(/Archive Contents Are Locked/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter password to unlock/i)).toHaveValue("");
    expect(screen.queryByText(/notes.txt/i)).not.toBeInTheDocument();
  });

  it("exiting the file viewer automatically returns the archive to the locked state", async () => {
    vi.mocked(zipService.verifyZipArchive).mockResolvedValueOnce({
      isValidZip: true,
      isEncrypted: true,
      encryptionType: "AES-256",
      entriesCount: 1,
      totalUncompressedBytes: 100,
      testDecryptionSuccess: true,
      entries: [
        {
          filename: "secret-data.txt",
          compressedSize: 50,
          uncompressedSize: 100,
          encrypted: true,
          directory: false,
        },
      ],
    });

    vi.mocked(zipService.extractZipEntry).mockResolvedValueOnce({
      filename: "secret-data.txt",
      size: 100,
      blob: new Blob(["Top Secret Content"]),
      text: "Top Secret Content",
      isText: true,
      isImage: false,
      mimeType: "text/plain",
    });

    render(
      <VerifyModal
        isOpen={true}
        onClose={vi.fn()}
        currentResult={mockCurrentResult}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter password to unlock/i), {
      target: { value: "Pass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Unlock Archive/i }));

    await waitFor(() => {
      expect(screen.getByText("secret-data.txt")).toBeInTheDocument();
    });

    // Click "View" on secret-data.txt
    const viewBtn = screen.getByTitle(/Open and view secret-data.txt/i);
    fireEvent.click(viewBtn);

    await waitFor(() => {
      expect(screen.getByText("Top Secret Content")).toBeInTheDocument();
    });

    // Click "Exit & Lock File"
    const exitFileBtn = screen.getByTitle(/Close file and return to locked state/i);
    fireEvent.click(exitFileBtn);

    // Verify it automatically returned to locked state, requiring password again
    expect(screen.getByText(/Archive Contents Are Locked/i)).toBeInTheDocument();
    expect(screen.queryByText("Top Secret Content")).not.toBeInTheDocument();
    expect(screen.queryByText("secret-data.txt")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter password to unlock/i)).toHaveValue("");
  });

  it("closing the modal purges decrypted state so reopening strictly requires the password again", async () => {
    vi.mocked(zipService.verifyZipArchive).mockResolvedValue({
      isValidZip: true,
      isEncrypted: true,
      encryptionType: "AES-256",
      entriesCount: 1,
      totalUncompressedBytes: 100,
      testDecryptionSuccess: true,
      entries: [
        {
          filename: "passwords.txt",
          compressedSize: 50,
          uncompressedSize: 100,
          encrypted: true,
          directory: false,
        },
      ],
    });

    const handleClose = vi.fn();
    const { rerender } = render(
      <VerifyModal
        isOpen={true}
        onClose={handleClose}
        currentResult={mockCurrentResult}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter password to unlock/i), {
      target: { value: "CorrectPassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Unlock Archive/i }));

    await waitFor(() => {
      expect(screen.getByText("passwords.txt")).toBeInTheDocument();
    });

    // Click Close & Lock
    const closeBtn = screen.getByRole("button", { name: /Close & Lock/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();

    // Rerender simulating parent closing and reopening the modal
    rerender(
      <VerifyModal
        isOpen={false}
        onClose={handleClose}
        currentResult={mockCurrentResult}
      />
    );

    rerender(
      <VerifyModal
        isOpen={true}
        onClose={handleClose}
        currentResult={mockCurrentResult}
      />
    );

    // Reopened modal must strictly be locked and require the password again
    expect(screen.getByText(/Archive Contents Are Locked/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter password to unlock/i)).toHaveValue("");
    expect(screen.queryByText("passwords.txt")).not.toBeInTheDocument();
  });
});
