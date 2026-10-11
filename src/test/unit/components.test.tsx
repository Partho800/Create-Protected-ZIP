import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PasswordForm } from "@/components/PasswordForm";
import { Header } from "@/components/Header";

describe("UI Components Suite", () => {
  it("PasswordForm renders password and confirmation inputs with strength meter", () => {
    const handlePasswordChange = vi.fn();
    const handleConfirmChange = vi.fn();
    const handleToggleShow = vi.fn();

    render(
      <PasswordForm
        password="MySecretPassword123!"
        confirmPassword="MySecretPassword123!"
        showPassword={false}
        onPasswordChange={handlePasswordChange}
        onConfirmPasswordChange={handleConfirmChange}
        onToggleShowPassword={handleToggleShow}
      />
    );

    const passwordInput = screen.getByPlaceholderText(/Enter.*encryption password/i);
    const confirmInput = screen.getByPlaceholderText(/Re-enter to confirm/i);

    expect(passwordInput).toBeInTheDocument();
    expect(confirmInput).toBeInTheDocument();
    expect(screen.getByText(/Strength:/i)).toBeInTheDocument();

    expect(screen.getByText(/Very Strong/i)).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: "NewPass#2026" } });
    expect(handlePasswordChange).toHaveBeenCalledWith("NewPass#2026");
  });

  it("PasswordForm displays error message when passwords mismatch", () => {
    render(
      <PasswordForm
        password="Password123!"
        confirmPassword="PasswordMismatch"
        showPassword={false}
        onPasswordChange={vi.fn()}
        onConfirmPasswordChange={vi.fn()}
        onToggleShowPassword={vi.fn()}
      />
    );

    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it("Header renders branding, AES-256 badge, and trigger buttons", () => {
    const handleReset = vi.fn();
    const handleOpenVerify = vi.fn();

    render(
      <Header
        onReset={handleReset}
        onOpenVerify={handleOpenVerify}
        hasFiles={true}
      />
    );

    expect(screen.getByText(/Secure ZIP Creator/i)).toBeInTheDocument();
    expect(screen.getByText(/AES-256/i)).toBeInTheDocument();

    const verifyBtn = screen.getByTitle(/Unlock or inspect/i);
    fireEvent.click(verifyBtn);
    expect(handleOpenVerify).toHaveBeenCalled();

    const resetBtn = screen.getByTitle(/Reset/i);
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalled();

  });
});

