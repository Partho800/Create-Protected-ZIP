"use client";

import React, { useMemo, useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Check,
  X,
  Sparkles,
  Copy,
  Shield,
} from "lucide-react";
import { evaluatePasswordStrength } from "@/services/passwordStrength";

interface PasswordFormProps {
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  encryptionMode?: "aes-256" | "zipcrypto";
  onPasswordChange: (pwd: string) => void;
  onConfirmPasswordChange: (pwd: string) => void;
  onToggleShowPassword: () => void;
  onEncryptionModeChange?: (mode: "aes-256" | "zipcrypto") => void;
  disabled?: boolean;
}

export function PasswordForm({
  password,
  confirmPassword,
  showPassword,
  encryptionMode = "zipcrypto",
  onPasswordChange,
  onConfirmPasswordChange,
  onToggleShowPassword,
  onEncryptionModeChange,
  disabled = false,
}: PasswordFormProps) {
  const [copied, setCopied] = useState(false);

  const strength = useMemo(() => {
    return evaluatePasswordStrength(password);
  }, [password]);

  const passwordsMatch = useMemo(() => {
    if (!password || !confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const handleGenerateStrong = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~|}{[]:;?><=";
    const array = new Uint32Array(16);
    crypto.getRandomValues(array);
    let generated = "";
    for (let i = 0; i < 16; i++) {
      generated += chars[array[i] % chars.length];
    }
    onPasswordChange(generated);
    onConfirmPasswordChange(generated);

    navigator.clipboard?.writeText(generated).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Encryption Password</h3>
            <p className="text-xs text-zinc-400">
              Mandatory AES-256 AE-2 cipher key
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={handleGenerateStrong}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors disabled:opacity-50"
          title="Generate a cryptographically secure 16-character password"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Strong</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Master Password */}
        <div>
          <label
            htmlFor="archive-password"
            className="block text-xs font-medium text-zinc-300 mb-1.5"
          >
            Password <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <input
              id="archive-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              disabled={disabled}
              placeholder="Enter strong encryption password"
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50 font-mono"
            />
            <button
              type="button"
              onClick={onToggleShowPassword}
              disabled={disabled}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="archive-confirm-password"
            className="block text-xs font-medium text-zinc-300 mb-1.5"
          >
            Confirm Password <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <input
              id="archive-confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              disabled={disabled}
              placeholder="Re-enter to confirm"
              className={`w-full px-3.5 py-2.5 pr-10 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 font-mono ${
                passwordsMatch === false
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : passwordsMatch === true
                  ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500"
                  : "border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500"
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {passwordsMatch === true && (
                <Check className="w-4 h-4 text-emerald-400" />
              )}
              {passwordsMatch === false && (
                <X className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Encryption Compatibility Selector */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-xs font-medium text-zinc-300">
          Encryption Standard &amp; Compatibility
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onEncryptionModeChange?.("zipcrypto")}
            className={`p-3 rounded-xl border text-left transition-all ${
              encryptionMode === "zipcrypto"
                ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30 text-white shadow-sm"
                : "bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            }`}
          >
            <div className="text-xs font-semibold flex items-center gap-1.5 text-zinc-100">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              Windows Native (ZipCrypto)
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 leading-snug">
              Prompts password directly in Windows File Explorer
            </div>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onEncryptionModeChange?.("aes-256")}
            className={`p-3 rounded-xl border text-left transition-all ${
              encryptionMode === "aes-256"
                ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30 text-white shadow-sm"
                : "bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            }`}
          >
            <div className="text-xs font-semibold flex items-center gap-1.5 text-zinc-100">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              AES-256 (Military Grade)
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 leading-snug">
              Standard for 7-Zip, WinRAR, WinZip &amp; Web Vault
            </div>
          </button>
        </div>
      </div>

      {/* Password Strength Indicator */}
      {password.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-zinc-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-zinc-500" />
              Cipher Strength:
            </span>
            <span
              className={`font-semibold ${
                strength.score === 4
                  ? "text-emerald-400"
                  : strength.score === 3
                  ? "text-blue-400"
                  : strength.score === 2
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {strength.label}
            </span>
          </div>

          {/* Progress bar with 4 segments */}
          <div className="grid grid-cols-4 gap-1.5 h-1.5">
            {[0, 1, 2, 3].map((step) => (
              <div
                key={step}
                className={`rounded-full transition-all duration-300 ${
                  step <= strength.score - 1
                    ? strength.score === 4
                      ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                      : strength.score === 3
                      ? "bg-blue-500"
                      : strength.score === 2
                      ? "bg-amber-500"
                      : "bg-red-500"
                    : "bg-zinc-800"
                }`}
              />
            ))}
          </div>

          {/* Checklist criteria */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                strength.hasMinLength
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-zinc-500 bg-zinc-900"
              }`}
            >
              {strength.hasMinLength ? <Check className="w-3 h-3" /> : "•"} 8+ Chars
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                strength.hasUppercase
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-zinc-500 bg-zinc-900"
              }`}
            >
              {strength.hasUppercase ? <Check className="w-3 h-3" /> : "•"} Uppercase
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                strength.hasLowercase
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-zinc-500 bg-zinc-900"
              }`}
            >
              {strength.hasLowercase ? <Check className="w-3 h-3" /> : "•"} Lowercase
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                strength.hasNumber
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-zinc-500 bg-zinc-900"
              }`}
            >
              {strength.hasNumber ? <Check className="w-3 h-3" /> : "•"} Number
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                strength.hasSymbol
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-zinc-500 bg-zinc-900"
              }`}
            >
              {strength.hasSymbol ? <Check className="w-3 h-3" /> : "•"} Symbol
            </span>
          </div>
        </div>
      )}

      {passwordsMatch === false && (
        <div className="text-xs text-red-400 flex items-center gap-1.5">
          <X className="w-3.5 h-3.5" />
          Passwords do not match. Please ensure both fields are identical.
        </div>
      )}
    </div>
  );
}
