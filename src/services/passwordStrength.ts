import { PasswordStrength } from "@/types/zip";

/**
 * Evaluates the strength and security entropy of a provided password.
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: "Very Weak",
      color: "text-zinc-400 bg-zinc-200 dark:bg-zinc-700",
      feedback: ["Enter a password to protect your archive."],
      hasMinLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSymbol: false,
    };
  }

  const hasMinLength = password.length >= 8;
  const hasStrongLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const feedback: string[] = [];
  if (!hasMinLength) feedback.push("Use at least 8 characters.");
  if (!hasUppercase) feedback.push("Include uppercase letters (A-Z).");
  if (!hasLowercase) feedback.push("Include lowercase letters (a-z).");
  if (!hasNumber) feedback.push("Include numbers (0-9).");
  if (!hasSymbol) feedback.push("Include special characters (!@#$%^&*).");

  let points = 0;
  if (password.length >= 8) points += 1;
  if (hasStrongLength) points += 1;
  if (hasUppercase && hasLowercase) points += 1;
  if (hasNumber) points += 1;
  if (hasSymbol) points += 1;

  // Normalization to 0-4
  let score: 0 | 1 | 2 | 3 | 4 = 0;
  if (password.length < 6) {
    score = 0;
  } else if (points <= 2) {
    score = 1;
  } else if (points === 3) {
    score = 2;
  } else if (points === 4) {
    score = 3;
  } else {
    score = 4;
  }

  const labels: Record<0 | 1 | 2 | 3 | 4, "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong"> = {
    0: "Very Weak",
    1: "Weak",
    2: "Fair",
    3: "Strong",
    4: "Very Strong",
  };

  const colors: Record<0 | 1 | 2 | 3 | 4, string> = {
    0: "text-red-500 bg-red-500",
    1: "text-orange-500 bg-orange-500",
    2: "text-amber-500 bg-amber-500",
    3: "text-blue-500 bg-blue-500",
    4: "text-emerald-500 bg-emerald-500",
  };

  return {
    score,
    label: labels[score],
    color: colors[score],
    feedback: feedback.length > 0 ? feedback : ["Excellent AES-256 passphrase!"],
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSymbol,
  };
}

/**
 * Validates that passwords match and meet minimum security baseline.
 */
export function validatePasswordMatch(
  password: string,
  confirm: string
): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: "Password is required to encrypt the archive." };
  }
  if (!confirm) {
    return { isValid: false, error: "Please confirm your password." };
  }
  if (password !== confirm) {
    return { isValid: false, error: "Passwords do not match." };
  }
  return { isValid: true };
}
