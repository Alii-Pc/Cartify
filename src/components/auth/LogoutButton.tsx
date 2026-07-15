"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutUser } from "@/lib/authClient";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  return (
    <Button
      variant="secondary"
      onClick={handleLogout}
      isLoading={loading}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      Log out
    </Button>
  );
}
