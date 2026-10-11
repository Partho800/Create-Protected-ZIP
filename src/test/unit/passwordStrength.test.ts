import { describe, it, expect } from "vitest";
import {
  evaluatePasswordStrength,
  validatePasswordMatch,
} from "@/services/passwordStrength";

describe("Password Strength & Validation Service", () => {
  it("should evaluate empty password as Very Weak with score 0", () => {
    const result = evaluatePasswordStrength("");
    expect(result.score).toBe(0);
    expect(result.label).toBe("Very Weak");
    expect(result.hasMinLength).toBe(false);
  });

  it("should evaluate short password (< 6 chars) as score 0", () => {
    const result = evaluatePasswordStrength("abc");
    expect(result.score).toBe(0);
    expect(result.label).toBe("Very Weak");
  });

  it("should evaluate simple password without variety as Weak", () => {
    const result = evaluatePasswordStrength("abcdefgh");
    expect(result.hasMinLength).toBe(true);
    expect(result.hasUppercase).toBe(false);
    expect(result.hasNumber).toBe(false);
    expect(result.hasSymbol).toBe(false);
    expect(result.score).toBeLessThanOrEqual(2);
  });

  it("should evaluate mixed password as Strong or Very Strong", () => {
    const result = evaluatePasswordStrength("Secur3P@ssw0rd!2026");
    expect(result.score).toBe(4);
    expect(result.label).toBe("Very Strong");
    expect(result.hasMinLength).toBe(true);
    expect(result.hasUppercase).toBe(true);
    expect(result.hasLowercase).toBe(true);
    expect(result.hasNumber).toBe(true);
    expect(result.hasSymbol).toBe(true);
  });

  it("should validate matching passwords", () => {
    const res = validatePasswordMatch("CorrectHorseBatteryStaple", "CorrectHorseBatteryStaple");
    expect(res.isValid).toBe(true);
    expect(res.error).toBeUndefined();
  });

  it("should reject mismatching passwords", () => {
    const res = validatePasswordMatch("Pass123", "Pass456");
    expect(res.isValid).toBe(false);
    expect(res.error).toBe("Passwords do not match.");
  });

  it("should reject empty password", () => {
    const res = validatePasswordMatch("", "");
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("required");
  });

  it("should reject empty confirm password", () => {
    const res = validatePasswordMatch("Pass123", "");
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("confirm");
  });
});
