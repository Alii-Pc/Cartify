"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategorySchema, CreateCategoryInput } from "@/lib/validations/category";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface CategoryFormProps {
  initialData?: {
    _id: string;
    name: string;
    slug: string;
    emoji: string;
    description: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ initialData, onSuccess, onCancel }: CategoryFormProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      emoji: initialData?.emoji || "🏷️",
      description: initialData?.description || "",
    }
  });

  const emoji = watch("emoji");

  const onSubmit = async (data: CreateCategoryInput) => {
    setIsSubmitting(true);
    try {
      const url = initialData ? `/api/categories/${initialData.slug}` : "/api/categories";
      const method = initialData ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Something went wrong");
      }
      
      addToast("success", `Category ${initialData ? "updated" : "created"} successfully`);
      onSuccess();
    } catch (error: any) {
      addToast("error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Name"
        {...register("name")}
        error={errors.name?.message}
        placeholder="e.g. Kitchen"
      />
      
      {!initialData && (
        <Input
          label="Slug (optional)"
          {...register("slug")}
          error={errors.slug?.message}
          placeholder="e.g. kitchen"
        />
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            label="Emoji"
            {...register("emoji")}
            error={errors.emoji?.message}
            placeholder="e.g. 🍳"
          />
        </div>
        <div className="flex items-end pb-1">
          <div className="h-[42px] w-[42px] flex items-center justify-center bg-cream-50 rounded-lg border border-olive-200 text-xl">
            {emoji || "🏷️"}
          </div>
        </div>
      </div>

      <div className="w-full">
        <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
          Description
        </label>
        <textarea
          {...register("description")}
          className={`input-field min-h-[100px] w-full ${errors.description ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
          placeholder="Category description..."
        />
        {errors.description && (
          <p className="mt-1.5 text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-black/5 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
