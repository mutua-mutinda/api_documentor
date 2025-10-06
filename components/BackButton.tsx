"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

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
  showIcon = true,
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
      className={`inline-flex items-center space-x-2 text-sm font-medium text-gray-200 hover:text-gray-300 transition-colors ${className}`}
    >
      {showIcon && <ArrowLeft className="h-4 w-4" />}
      <span>{label}</span>
    </button>
  );
}
