import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secure ZIP Creator — Client-Side AES-256 Password-Protected ZIP",
  description:
    "Create password-protected AES-256 encrypted ZIP archives directly inside your browser. 100% private, client-side Web Cryptography, folder structure preservation, and ZIP64 support.",
  keywords: [
    "secure zip",
    "password protect zip",
    "aes-256 zip",
    "browser zip creator",
    "encrypted zip",
    "client-side encryption",
  ],
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-zinc-950"
      >
        {children}
      </body>
    </html>
  );
}
