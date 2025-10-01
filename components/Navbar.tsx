"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, BookOpen } from "lucide-react";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/articles",
      label: "Articles",
      icon: BookOpen,
      active: pathname === "/articles" || pathname.startsWith("/articles/"),
    },
  ];

  return (
    <nav className={`bg-white border-b border-gray-200 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors"
          >
            <FileText className="h-8 w-8 text-blue-600" />
            <span>API Documentor</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
