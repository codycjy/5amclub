"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Settings, Menu, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  Avatar as AvatarUI,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import LanguageSwitcher from "../settings/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useAvatarUrl } from "@/hooks/useAvatarUrl"; // Add this import

export function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const supabase = createClient();
  const avatarUrl = useAvatarUrl(avatarPath); // Use the hook here

  const routes = [
    {
      label: t("navbar.dashboard"),
      icon: Home,
      href: "/app",
      color: "text-sky-500",
    },
    {
      label: t("navbar.friends"),
      icon: Users,
      href: "/friends",
      color: "text-green-500",
    },
    {
      label: t("navbar.settings"),
      icon: Settings,
      href: "/settings",
      color: "text-violet-500",
    },
  ];

  const getUserInfo = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("username, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (settings?.username) {
        setUsername(settings.username);
      } else {
        setUsername(user.email || "");
      }

      if (settings?.avatar_url) {
        setAvatarPath(settings.avatar_url);
      }
    } else {
      setUsername("");
      setAvatarPath(null);
    }
  };

  useEffect(() => {
    getUserInfo();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        getUserInfo();
      } else if (event === "SIGNED_OUT") {
        setUsername("");
        setAvatarPath(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const UserInfo = () => (
    <div className="flex items-center gap-3">
      <div className="text-sm font-medium text-muted-foreground">
        {username}
      </div>
      <AvatarUI className="h-8 w-8">
        <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
        <AvatarFallback>{username?.[0]?.toUpperCase()}</AvatarFallback>
      </AvatarUI>
    </div>
  );
  return (
    <div className="fixed z-50 w-full bg-white border-b border-gray-200">
      {/* 将 max-w-7xl 改为 container，统一 padding */}
      <div className="container mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 h-16">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center justify-between h-16">
          <Link href={username ? "/app" : "/"} className="font-bold text-xl">
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
          {username &&
            routes.map((route) => (
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
          {username && <UserInfo />}
          <LanguageSwitcher />
        </nav>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="lg:hidden pb-4">
            {username &&
              routes.map((route) => (
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
            {username && (
              <div className="p-3">
                <UserInfo />
              </div>
            )}
          </nav>
        )}
      </div>
    </div>
  );
  return (
    <div className="fixed z-50 w-full bg-white border-b border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 lg:px-8 mx-auto max-w-7xl h-16">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center justify-between h-16">
          <Link href={username ? "/app" : "/"} className="font-bold text-xl">
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
          {username &&
            routes.map((route) => (
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
          {username && <UserInfo />}
          <LanguageSwitcher />
        </nav>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="lg:hidden pb-4">
            {username &&
              routes.map((route) => (
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
            {username && (
              <div className="p-3">
                <UserInfo />
              </div>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
