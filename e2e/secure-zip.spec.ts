import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Secure ZIP Creator E2E Browser Suite", () => {
  test("loads main dashboard with security badges and action controls", async ({ page }) => {
    await page.goto("/");

    // Verify Title & Brand
    await expect(page).toHaveTitle(/Secure ZIP Creator/i);
    await expect(page.locator("h1")).toContainText(/Secure ZIP Creator/i);

    // Verify Dropzone and Action Controls

    // Verify Dropzone
    await expect(page.getByRole("button", { name: /Select Files/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Select Complete Folder/i })).toBeVisible();

    // Verify Action button is initially disabled
    const createBtn = page.getByRole("button", { name: /Create AES-256 Encrypted ZIP/i });
    await expect(createBtn).toBeDisabled();
  });

  test("validates password matching in real-time", async ({ page }) => {
    await page.goto("/");

    const passwordInput = page.locator("#archive-password");
    const confirmInput = page.locator("#archive-confirm-password");

    await passwordInput.fill("StrongMasterPass123!");
    await confirmInput.fill("DifferentPassword");

    await expect(page.getByText(/Passwords do not match/i)).toBeVisible();

    // Fix mismatch
    await confirmInput.fill("StrongMasterPass123!");
    await expect(page.getByText(/Passwords do not match/i)).not.toBeVisible();
    await expect(page.getByText(/Very Strong/i)).toBeVisible();
  });

  test("generates strong random password via 1-click generator", async ({ page }) => {
    await page.goto("/");

    const generateBtn = page.getByRole("button", { name: /Generate Strong/i });
    await generateBtn.click();

    const passwordInput = page.locator("#archive-password");
    const confirmInput = page.locator("#archive-confirm-password");

    const passVal = await passwordInput.inputValue();
    const confVal = await confirmInput.inputValue();

    expect(passVal.length).toBe(16);
    expect(passVal).toBe(confVal);
    await expect(page.getByText(/Very Strong/i)).toBeVisible();
  });

  test("end-to-end flow: adds file, sets password, creates archive, verifies download and inspector", async ({
    page,
  }) => {
    await page.goto("/");

    // Create a temporary test file to upload
    const tempFilePath = path.join(__dirname, "test-file.txt");
    fs.writeFileSync(tempFilePath, "E2E Browser Test Payload Content", "utf-8");

    try {
      // Set input files using the hidden file input
      const fileChooserInput = page.locator("#file-input");
      await fileChooserInput.setInputFiles(tempFilePath);

      // Verify file is displayed in the Selected Entries list
      await expect(page.getByText("test-file.txt")).toBeVisible();
      await expect(page.getByText("Selected Entries")).toBeVisible();

      // Enter password & confirm
      const testPassword = "E2E-AES256-Pass#2026!";
      await page.locator("#archive-password").fill(testPassword);
      await page.locator("#archive-confirm-password").fill(testPassword);

      // Verify Create button is now enabled
      const createBtn = page.getByRole("button", { name: /Create AES-256 Encrypted ZIP/i });
      await expect(createBtn).toBeEnabled();

      // Setup download listener and click create
      const downloadPromise = page.waitForEvent("download", { timeout: 15000 });
      await createBtn.click();

      // Wait for download to start automatically
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe("test-file.zip");

      // Verify Success Card is displayed with metadata & SHA-256
      await expect(page.getByText(/Secure Archive Generated!/i)).toBeVisible();
      await expect(page.getByText(/SHA-256 Integrity Fingerprint:/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /Download Again/i })).toBeVisible();

      // Test opening the Inspector Modal
      const verifyBtn = page.getByRole("button", { name: /Verify AES-256 Encryption/i });
      await verifyBtn.click();

      await expect(page.getByText(/AES-256 Archive Inspector/i)).toBeVisible();
      await expect(page.getByText("AES-256 (Encrypted)")).toBeVisible();

      // Test decryption inside modal
      const testDecryptBtn = page.getByRole("button", { name: /Test Decrypt/i });
      await testDecryptBtn.click();

      await expect(page.getByText(/Success!/i)).toBeVisible();
    } finally {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  });
});
