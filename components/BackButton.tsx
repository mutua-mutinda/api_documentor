"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export default function BackButton({
  href,
  label = "Back",
  className = "",
  showIcon = true
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors ${className}`}
    >
      {showIcon && <ArrowLeft className="h-4 w-4" />}
      <span>{label}</span>
    </button>
  );
}
