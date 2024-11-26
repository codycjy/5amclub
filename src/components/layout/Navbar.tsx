"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const routes = [
  {
    label: "首页",
    icon: Home,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "设置",
    icon: Settings,
    href: "/settings",
    color: "text-violet-500",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed z-50 w-full bg-white border-b border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 lg:px-8 mx-auto max-w-7xl h-16">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl">
            打卡应用
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex lg:items-center lg:space-x-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === route.href
                  ? "text-black dark:text-white"
                  : "text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-x-2">
                <route.icon className={cn("w-4 h-4", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="lg:hidden pb-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center w-full p-3 text-sm font-medium transition-colors hover:text-primary rounded-lg",
                  pathname === route.href
                    ? "bg-gray-100 text-black"
                    : "text-muted-foreground",
                )}
                onClick={() => setIsOpen(false)}
              >
                <route.icon className={cn("w-4 h-4 mr-2", route.color)} />
                {route.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
