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
    <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md p-5 sm:p-6 space-y-5 shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Encryption Password</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Set a secure password for your archive
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={handleGenerateStrong}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          title="Generate a cryptographically secure 16-character password"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
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
            className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5"
          >
            Password <span className="text-emerald-500">*</span>
          </label>
          <div className="relative">
            <input
              id="archive-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              disabled={disabled}
              placeholder="Enter strong encryption password"
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50 font-mono"
            />
            <button
              type="button"
              onClick={onToggleShowPassword}
              disabled={disabled}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
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
            className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5"
          >
            Confirm Password <span className="text-emerald-500">*</span>
          </label>
          <div className="relative">
            <input
              id="archive-confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              disabled={disabled}
              placeholder="Re-enter to confirm"
              className={`w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-950 border text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 font-mono ${
                passwordsMatch === false
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : passwordsMatch === true
                  ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500"
                  : "border-slate-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500"
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {passwordsMatch === true && (
                <Check className="w-4 h-4 text-emerald-500" />
              )}
              {passwordsMatch === false && (
                <X className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Encryption Compatibility Selector */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
          Encryption Standard &amp; Compatibility
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onEncryptionModeChange?.("zipcrypto")}
            className={`px-3.5 py-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
              encryptionMode === "zipcrypto"
                ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 shadow-sm dark:bg-emerald-500/10 dark:border-emerald-500/50 dark:ring-emerald-500/30 dark:text-white"
                : "bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/80 text-slate-600 hover:text-slate-900 dark:bg-zinc-950/60 dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-zinc-700"
            }`}
          >
            <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-semibold truncate">
              Windows Native (ZipCrypto)
            </span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onEncryptionModeChange?.("aes-256")}
            className={`px-3.5 py-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
              encryptionMode === "aes-256"
                ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 shadow-sm dark:bg-emerald-500/10 dark:border-emerald-500/50 dark:ring-emerald-500/30 dark:text-white"
                : "bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/80 text-slate-600 hover:text-slate-900 dark:bg-zinc-950/60 dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-zinc-700"
            }`}
          >
            <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
            <span className="text-xs font-semibold truncate">
              AES-256 (Military Grade)
            </span>
          </button>
        </div>
      </div>


      {/* Password Strength Indicator */}
      {password.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-200/80 dark:border-zinc-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
              Cipher Strength:
            </span>
            <span
              className={`font-semibold ${
                strength.score === 4
                  ? "text-emerald-600 dark:text-emerald-400"
                  : strength.score === 3
                  ? "text-blue-600 dark:text-blue-400"
                  : strength.score === 2
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
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
                    : "bg-slate-200 dark:bg-zinc-800"
                }`}
              />
            ))}
          </div>

          {/* Checklist criteria */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                strength.hasMinLength
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                  : "text-slate-400 bg-slate-100 dark:text-zinc-500 dark:bg-zinc-900"
              }`}
            >
              {strength.hasMinLength ? <Check className="w-3 h-3" /> : "•"} 8+ Chars
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                strength.hasUppercase
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                  : "text-slate-400 bg-slate-100 dark:text-zinc-500 dark:bg-zinc-900"
              }`}
            >
              {strength.hasUppercase ? <Check className="w-3 h-3" /> : "•"} Uppercase
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                strength.hasLowercase
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                  : "text-slate-400 bg-slate-100 dark:text-zinc-500 dark:bg-zinc-900"
              }`}
            >
              {strength.hasLowercase ? <Check className="w-3 h-3" /> : "•"} Lowercase
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                strength.hasNumber
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                  : "text-slate-400 bg-slate-100 dark:text-zinc-500 dark:bg-zinc-900"
              }`}
            >
              {strength.hasNumber ? <Check className="w-3 h-3" /> : "•"} Number
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                strength.hasSymbol
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                  : "text-slate-400 bg-slate-100 dark:text-zinc-500 dark:bg-zinc-900"
              }`}
            >
              {strength.hasSymbol ? <Check className="w-3 h-3" /> : "•"} Symbol
            </span>
          </div>
        </div>
      )}

      {passwordsMatch === false && (
        <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
          <X className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Passwords do not match. Please ensure both fields are identical.</span>
        </div>
      )}
    </div>
  );
}

