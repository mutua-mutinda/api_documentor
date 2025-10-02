"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  return (
    <nav className={`z-50 ${className}`}>
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-semibold text-gray-200 hover:text-gray-300 transition-colors"
          >
            <FileText className="h-8 w-8 text-blue-600" />
            <span>API Documentor</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
