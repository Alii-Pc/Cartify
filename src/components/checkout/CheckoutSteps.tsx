"use client";
import React from "react";
import { MapPin, CreditCard, ClipboardCheck, Check } from "lucide-react";

interface CheckoutStepsProps {
  currentStep: 1 | 2 | 3;
}

export const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "Shipping", icon: MapPin },
    { num: 2, label: "Payment", icon: CreditCard },
    { num: 3, label: "Review & Pay", icon: ClipboardCheck },
  ];

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.num;
        const isActive = currentStep === step.num;
        const isUpcoming = currentStep < step.num;

        return (
          <React.Fragment key={step.num}>
            <div className="flex flex-col items-center relative">
              <div
                className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full transition-colors duration-300 ${
                  isCompleted
                    ? "bg-olive-700 text-cream-50"
                    : isActive
                    ? "bg-olive-700 text-cream-50 animate-pulse"
                    : "bg-olive-100 text-charcoal-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                  <step.icon className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </div>
              <span
                className={`hidden md:block text-xs mt-2 font-semibold ${
                  isActive || isCompleted ? "text-olive-800" : "text-charcoal-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 transition-colors duration-300 ${
                  currentStep > step.num ? "bg-olive-700" : "bg-olive-100"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
