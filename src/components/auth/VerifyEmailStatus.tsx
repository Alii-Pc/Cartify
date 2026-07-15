"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, RotateCw } from "lucide-react";
import { verifyEmailOtp, resendVerificationOtp } from "@/lib/authClient";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Start cooldown on mount if email is pre-filled (user just signed up)
  useEffect(() => {
    if (emailParam) setCooldown(RESEND_COOLDOWN);
  }, [emailParam]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // only single digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i]!;
    }
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmpty = newOtp.findIndex((v) => !v);
    const focusIdx = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = useCallback(async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setServerError("Please enter the full 6-digit code.");
      return;
    }
    if (!email) {
      setServerError("Please enter your email address.");
      return;
    }

    setServerError(null);
    setSuccessMessage(null);
    setIsVerifying(true);

    const result = await verifyEmailOtp(email, code);
    setIsVerifying(false);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    setVerified(true);
    setSuccessMessage(result.message ?? "Email verified successfully!");
    setTimeout(() => router.push("/login"), 2000);
  }, [otp, email, router]);

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (otp.every((d) => d) && email && !isVerifying && !verified) {
      handleVerify();
    }
  }, [otp, email, isVerifying, verified, handleVerify]);

  const handleResend = async () => {
    if (!email) {
      setServerError("Please enter your email address first.");
      return;
    }

    setServerError(null);
    setSuccessMessage(null);
    setIsResending(true);

    const result = await resendVerificationOtp(email);
    setIsResending(false);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    setSuccessMessage(result.message ?? "A new code has been sent.");
    setOtp(Array(OTP_LENGTH).fill(""));
    setCooldown(RESEND_COOLDOWN);
    inputRefs.current[0]?.focus();
  };

  if (verified) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="h-12 w-12 text-olive-600" />
        <p className="text-charcoal-700/80">{successMessage}</p>
        <Link href="/login" className="w-full">
          <Button className="w-full">Go to login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {serverError && <Alert type="error" message={serverError} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      {/* Email field (editable if not pre-filled) */}
      <div>
        <label
          htmlFor="verify-email"
          className="mb-1.5 block text-sm font-medium text-charcoal-700"
        >
          Email
        </label>
        <input
          id="verify-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input-field"
        />
      </div>

      {/* OTP inputs */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
          Verification code
        </label>
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`Digit ${i + 1}`}
              className="input-field h-14 w-full text-center text-xl font-semibold tracking-widest"
            />
          ))}
        </div>
      </div>

      <Button
        type="button"
        onClick={handleVerify}
        isLoading={isVerifying}
        className="w-full"
      >
        Verify email
      </Button>

      {/* Resend button with cooldown */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-olive-700
            transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50
            disabled:no-underline"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
          {cooldown > 0
            ? `Resend code in ${cooldown}s`
            : "Resend verification code"}
        </button>
      </div>

      <p className="text-center text-sm text-charcoal-700/70">
        Already verified?{" "}
        <Link href="/login" className="font-medium text-olive-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
