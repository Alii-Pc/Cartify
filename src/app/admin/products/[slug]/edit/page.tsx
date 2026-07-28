"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SafeProduct } from "@/types";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<SafeProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        const json = await res.json();
        
        if (json.success && json.data?.product) {
          setProduct(json.data.product);
        } else {
          addToast("error", json.message || "Failed to load product");
          router.push("/admin/products");
        }
      } catch (err) {
        addToast("error", "An error occurred while loading the product");
        router.push("/admin/products");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (slug) {
      fetchProduct();
    }
  }, [slug, addToast, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader />
        <p className="mt-4 text-charcoal-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="secondary" className="!px-2 h-10 w-10 flex items-center justify-center rounded-full">
            <ChevronLeft size={20} />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-semibold text-charcoal-900 truncate">
          Edit Product <span className="text-charcoal-400 font-normal">— {product.name}</span>
        </h1>
      </div>

      <ProductForm 
        initialData={product} 
        onSuccess={() => router.push("/admin/products")} 
      />
    </div>
  );
}
