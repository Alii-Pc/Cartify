import React from "react";
import { ShopLayout } from "@/components/layout/ShopLayout";

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <ShopLayout>{children}</ShopLayout>;
}
