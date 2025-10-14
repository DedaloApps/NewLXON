// src/components/layout/Header.tsx
"use client";

import { User, FolderKanban, Bell, Settings, LogOut, ChevronDown, Moon, Sun, Menu, X, HelpCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderPremiumProps {
  pageTitle?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
}

export function HeaderPremium({
  pageTitle,
  userName = "User",
  userEmail,
  userAvatar,
  notificationCount = 0,
}: HeaderPremiumProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getPageTitle = () => {
    if (pageTitle) return pageTitle;
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/onboarding") return "Configuração";
    if (pathname.includes("project")) return "Projetos";
    if (pathname.includes("content-hub")) return "Content Hub";
    return "LXon";
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-b shadow-sm"
            : "bg-background/80 backdrop-blur-md border-b border-border/40"
        }`}
      >
        <div className="w-full flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left: Page Title */}
          <div className="flex items-center">
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right: Actions + Profile */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-[1.2rem] w-[1.2rem]" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] animate-pulse"
                >
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Badge>
              )}
            </Button>

            {/* FAQs */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-9 w-9 hover:bg-primary/10 transition-colors"
            >
              <Link href="/faqs">
                <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
              </Link>
            </Button>

            {/* Projects */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-9 w-9 hover:bg-primary/10 transition-colors"
            >
              <Link href="/dashboard">
                <FolderKanban className="h-[1.2rem] w-[1.2rem]" />
              </Link>
            </Button>

            {/* Divider */}
            <div className="h-6 w-px bg-border mx-1" />

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-90 transition-all group">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-semibold">{userName}</span>
                    {userEmail && (
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {userEmail}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-border group-hover:border-primary transition-all"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center border-2 border-border group-hover:border-primary transition-all shadow-md">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{userName}</span>
                    {userEmail && (
                      <span className="text-xs text-muted-foreground font-normal">
                        {userEmail}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}