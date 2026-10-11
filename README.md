# Secure ZIP Creator (Client-Side AES-256 Encrypted ZIP Creator)

A high-performance, zero-knowledge browser application built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. It allows users to select individual files or complete directory structures, set and confirm an encryption passphrase, generate a military-grade **AES-256-encrypted ZIP archive** directly in the browser via Web Cryptography and Web Workers, and automatically trigger the download of the finished archive.

---

## Key Features

- **100% Client-Side Privacy**: All file scanning, compression, encryption, and hashing occur entirely inside your browser sandbox. Files and passwords are never transmitted to any external server.
- **Strict AES-256 Encryption**: Powered by `@zip.js/zip.js` with `encryptionStrength: 3` (AES-256 in WinZip AE-2 format). Never silently downgrades to unencrypted ZIP or weak legacy ZipCrypto.
- **Smart Automatic Filename Derivation**: Automatically names the downloaded ZIP after the uploaded folder (e.g. `MyProject.zip`) or file (e.g. `Report.zip`), providing a frictionless workflow.
- **High-Power Maximum Deflate Compression**: Configured out of the box with maximum compression efficiency (level 9) backed by Web Workers for non-blocking multi-threaded processing.
- **Folder Preservation & Duplicate Handling**: Recursively traverses drag-and-dropped folders and maintains nested subdirectory hierarchies. Disambiguates identically named files in different paths safely.
- **ZIP64 Architecture**: Supports large archives (> 4 GB) and collections exceeding 65,535 files.
- **Interactive AES-256 Inspector & Decryptor**: Built-in inspector modal to examine central directory records, verify encryption flags, and test password decryption in real-time.
- **Integrity Fingerprinting**: Generates SHA-256 checksums for each archive using the standard Web Cryptography API (`crypto.subtle`).
- **Real-Time Progress & Cancellation**: Displays file-by-file status, byte counters, and smooth progress tracking with full `AbortController` cancellation support.

---

## Project Structure

```
├── .next/                         # Next.js build output
├── e2e/                           # Browser end-to-end test suite (Playwright)
│   └── secure-zip.spec.ts         # Full user flow, download, and verification tests
├── public/                        # Static assets
├── src/
│   ├── app/
│   │   ├── globals.css            # Tailwind CSS styling and theme
│   │   ├── layout.tsx             # Root layout with metadata and dark theme
│   │   └── page.tsx               # Main dashboard orchestrator (no business logic)
│   ├── components/                # Modular reusable UI components
│   │   ├── ArchiveSettings.tsx    # Standalone archive configuration module
│   │   ├── Dropzone.tsx           # Drag & drop area with recursive directory scanning
│   │   ├── FileList.tsx           # Interactive file tree, path viewer, and removal
│   │   ├── Footer.tsx             # Privacy and security disclosure footer
│   │   ├── Header.tsx             # Navigation bar with inspector & reset triggers
│   │   ├── PasswordForm.tsx       # Password input, match validation, strength gauge, generator
│   │   ├── ProgressBar.tsx        # Live progress bar, metrics, and cancel handler
│   │   ├── SecurityBadge.tsx      # Security architecture badge display
│   │   ├── SuccessCard.tsx        # Download confirmation, SHA-256 hash, verify button
│   │   └── VerifyModal.tsx        # In-browser AES-256 inspector & test decryption modal
│   ├── hooks/
│   │   └── useSecureZip.ts        # React hook managing zip lifecycle, state, auto-download, and cleanup
│   ├── services/                  # Pure service layer (separated from UI components)
│   │   ├── fileScanner.ts         # Path normalization, directory parsing, and auto-naming
│   │   ├── passwordStrength.ts    # Cipher entropy calculator and match validator
│   │   └── zipService.ts          # Core AES-256 zip creation, verification, and SHA-256 calculation
│   └── types/
│       └── zip.ts                 # TypeScript interfaces and type definitions
├── playwright.config.ts           # Playwright E2E configuration
├── vitest.config.ts               # Vitest unit and integration testing configuration
├── tsconfig.json                  # TypeScript compiler settings
├── package.json                   # Project scripts and dependencies
└── README.md                      # Documentation, browser specs, and security proofs
```

---

## Installation & Setup

### Prerequisites
- Node.js `v18.17+` (v20+ or v24+ recommended)
- npm, pnpm, yarn, or bun

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## Running Automated Tests

The application includes unit, integration, and browser end-to-end testing suites:

```bash
# Run unit & integration tests (Vitest)
npm run test

# Run tests in watch mode
npm run test:watch

# Run Playwright E2E tests (if browser binaries installed)
npm run test:e2e
```

### Test Coverage Highlights
- **Password Strength Evaluation**: Tests empty, weak, medium, and very strong passphrases, character classes, and mismatch validation.
- **Path Normalization & Disambiguation**: Tests Windows backslash normalization, relative path trimming, folder structure preservation, and duplicate filename disambiguation.
- **AES-256 Encryption Proof**: Creates actual archives with `@zip.js/zip.js`, inspects `entry.encrypted === true`, verifies correct-password decryption matches original plaintext, and asserts incorrect passwords throw an `Invalid password` error.
- **Cancellation & Cleanup**: Tests `AbortSignal` cancellation mid-operation.
- **Downgrade Prevention**: Proves that empty or blank passwords reject with an explicit security policy error.

---

## Cryptographic Security Verification

### How AES-256 is Applied in the ZIP Container
1. **AE-2 Format (WinZip AES Standard)**:
   - File data is encrypted with AES in Counter Mode (AES-CTR) using a 256-bit symmetric key (`encryptionStrength: 3`).
   - The key is derived using **PBKDF2** (Password-Based Key Derivation Function 2) with HMAC-SHA1 and a 128-bit cryptographic salt drawn per file entry.
   - An authenticated HMAC-SHA1 authentication code is appended to verify ciphertext integrity before decryption.
2. **CRC-32 Masking (AE-2)**:
   - In traditional ZipCrypto, the unencrypted CRC-32 checksum is stored in the header, leaking information to attackers who attempt dictionary attacks against plaintexts.
   - In AE-2 format used by this application, the CRC-32 is masked (set to `0`), preventing attackers from guessing file contents without the passphrase.
3. **Never Downgrades**:
   - Creating an archive without a password or with legacy ZipCrypto is programmatically blocked in `zipService.ts`.

---

## Browser Compatibility & File-Size Limits

| Feature | Chrome / Edge (Chromium) | Firefox | Safari (WebKit) |
| :--- | :--- | :--- | :--- |
| **AES-256 Web Cryptography** | Supported (Full) | Supported (Full) | Supported (Full) |
| **Web Workers** | Supported | Supported | Supported |
| **Folder Drag-and-Drop** | `webkitGetAsEntry` (Full) | Supported | Supported |
| **Folder Picker Input** | `webkitdirectory` (Full) | `webkitdirectory` (Full) | `webkitdirectory` (Full) |
| **Streaming Compression** | Supported | Supported | Supported |

### Memory & File-Size Limitations
- **Chromium (Chrome/Edge)**: Can handle archives up to 2 GB - 4 GB+ in memory because `Blob` storage is paged to disk under memory pressure.
- **Firefox**: Recommended archive size is up to ~2 GB depending on available system RAM.
- **Safari**: Retains intermediate memory copies; archives up to 1 GB are recommended.
- **Memory Cleanup**: Active Object URLs are automatically revoked upon reset, regeneration, or component unmount via `URL.revokeObjectURL()` to prevent memory leaks.

---

## License

MIT License. Free and open source for personal and enterprise use.
