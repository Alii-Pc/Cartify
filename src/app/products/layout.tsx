import React from "react";
import { ShopLayout } from "@/components/layout/ShopLayout";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <ShopLayout>{children}</ShopLayout>;
}
