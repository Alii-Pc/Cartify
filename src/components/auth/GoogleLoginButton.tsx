"use client";

import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useToast } from "@/components/ui/Toast";
import { loginWithGoogle, linkGoogleAccount } from "@/lib/authClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface GoogleLoginButtonProps {
  action: "login" | "link";
  onSuccess?: () => void;
}

export function GoogleLoginButton({ action, onSuccess }: GoogleLoginButtonProps) {
  const { addToast } = useToast();
  const { fetchUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    
    setLoading(true);
    try {
      if (action === "login") {
        const res = await loginWithGoogle(credentialResponse.credential);
        if (res.success) {
          await fetchUser();
          addToast("success", "Successfully logged in with Google!");
          router.push("/dashboard");
          if (onSuccess) onSuccess();
        } else {
          addToast("error", res.message || "Failed to login with Google");
        }
      } else if (action === "link") {
        const res = await linkGoogleAccount(credentialResponse.credential);
        if (res.success) {
          await fetchUser();
          addToast("success", "Google account linked successfully!");
          if (onSuccess) onSuccess();
        } else {
          addToast("error", res.message || "Failed to link Google account");
        }
      }
    } catch (err) {
      addToast("error", "An error occurred during Google authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    addToast("error", "Google authentication failed");
  };

  return (
    <div className={`flex justify-center w-full ${loading ? "opacity-50 pointer-events-none" : ""}`}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={action === "login"}
        theme="outline"
        size="large"
        text={action === "link" ? "continue_with" : "continue_with"}
        shape="rectangular"
      />
    </div>
  );
}
