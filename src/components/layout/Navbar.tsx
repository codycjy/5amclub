"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

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
  const [username, setUsername] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    async function getUsername() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: settings } = await supabase
          .from("user_settings")
          .select("username")
          .eq("user_id", user.id)
          .single();

        if (settings?.username) {
          setUsername(settings.username);
        } else {
          setUsername(user.email?.split("@")[0] || "");
        }
      }
    }

    getUsername();
  });

  return (
    <div className="fixed z-50 w-full bg-white border-b border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 lg:px-8 mx-auto max-w-7xl h-16">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl">
            5 AM Club
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
                  : "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-x-2">
                <route.icon className={cn("w-4 h-4", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
          {username && (
            <div className="text-sm font-medium text-muted-foreground">
              {username}
            </div>
          )}
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
                    : "text-muted-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <route.icon className={cn("w-4 h-4 mr-2", route.color)} />
                {route.label}
              </Link>
            ))}
            {username && (
              <div className="p-3 text-sm font-medium text-muted-foreground">
                {username}
              </div>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
