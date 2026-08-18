import React from "react";
import { ShopLayout } from "@/components/layout/ShopLayout";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <ShopLayout>{children}</ShopLayout>;
}
