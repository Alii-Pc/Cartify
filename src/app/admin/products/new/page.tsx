"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/Button";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="secondary" className="!px-2 h-10 w-10 flex items-center justify-center rounded-full">
            <ChevronLeft size={20} />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-semibold text-charcoal-900">Add New Product</h1>
      </div>

      <ProductForm onSuccess={() => router.push("/admin/products")} />
    </div>
  );
}
