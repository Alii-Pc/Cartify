"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyEmailToken } from "@/lib/authClient";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";

type Status = "loading" | "success" | "error";

export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token was provided.");
      return;
    }

    verifyEmailToken(token).then((result) => {
      if (result.success) {
        setStatus("success");
        setMessage(result.message ?? "Email verified successfully.");
      } else {
        setStatus("error");
        setMessage(result.message);
      }
    });
  }, [token]);

  if (status === "loading") {
    return <Loader label="Verifying your email..." />;
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {status === "success" ? (
        <CheckCircle2 className="h-12 w-12 text-olive-600" />
      ) : (
        <XCircle className="h-12 w-12 text-red-500" />
      )}
      <p className="text-charcoal-700/80">{message}</p>
      <Link href="/login" className="w-full">
        <Button className="w-full">Go to login</Button>
      </Link>
      {status === "error" && (
        <Link
          href="/resend-verification"
          className="text-sm font-medium text-olive-700 hover:underline"
        >
          Request a new verification link
        </Link>
      )}
    </div>
  );
}
