// src/components/layout/Header.tsx
"use client";

import { User, FolderKanban, Bell, Settings, LogOut, ChevronDown, Moon, Sun, Menu, X, HelpCircle, Clock, CheckCircle, AlertCircle, Trash2, Home } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";

interface HeaderPremiumProps {
  pageTitle?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
}

// 🆕 TIPO DE NOTIFICAÇÃO
interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
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
  
  // 🆕 Estado de notificações
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Post agendado com sucesso!",
      message: "O teu post foi agendado para amanhã às 09:00",
      time: "Agora mesmo",
      read: false,
      actionUrl: "/content-hub",
    },
    {
      id: "2",
      type: "info",
      title: "Novo insights disponível",
      message: "Análise de engagement da última semana está pronta",
      time: "Há 2 horas",
      read: false,
    },
    {
      id: "3",
      type: "success",
      title: "Post publicado!",
      message: "O post 'Como aumentar produtividade' foi publicado no Instagram",
      time: "Há 5 horas",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
    if (pathname === "/profile") return "Perfil";
    if (pathname.includes("project")) return "Projetos";
    if (pathname.includes("content-hub")) return "Content Hub";
    return "LXon";
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  // 🆕 Marcar notificação como lida
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // 🆕 Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // 🆕 Remover notificação
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // 🆕 Ícone por tipo
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  // 🆕 Cor de fundo por tipo
  const getNotificationBg = (type: string, read: boolean) => {
    if (read) return "bg-gray-50 dark:bg-gray-800/50";
    
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-950/30";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950/30";
      case "error":
        return "bg-red-50 dark:bg-red-950/30";
      default:
        return "bg-blue-50 dark:bg-blue-950/30";
    }
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
          {/* Left: Back to Home + Page Title */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-9 w-9 hover:bg-primary/10 transition-colors"
            >
              <Link href="/dashboard">
                <Home className="h-[1.2rem] w-[1.2rem]" />
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
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

            {/* 🆕 Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                  <Bell className="h-[1.2rem] w-[1.2rem]" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] animate-pulse"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[380px] p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h3 className="font-semibold text-base">Notificações</h3>
                    <p className="text-xs text-muted-foreground">
                      {unreadCount > 0
                        ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}`
                        : "Tudo lido"}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs h-7"
                    >
                      Marcar todas como lidas
                    </Button>
                  )}
                </div>

                {/* Notifications List */}
                <ScrollArea className="h-[400px]">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <Bell className="w-12 h-12 text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground text-center">
                        Sem notificações
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 transition-colors hover:bg-muted/50 ${
                            getNotificationBg(notification.type, notification.read)
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4
                                  className={`text-sm font-semibold ${
                                    notification.read
                                      ? "text-muted-foreground"
                                      : "text-foreground"
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                                )}
                              </div>

                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {notification.message}
                              </p>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {notification.time}
                                </span>

                                <div className="flex items-center gap-1">
                                  {notification.actionUrl && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs px-2"
                                      asChild
                                    >
                                      <Link
                                        href={notification.actionUrl}
                                        onClick={() => markAsRead(notification.id)}
                                      >
                                        Ver
                                      </Link>
                                    </Button>
                                  )}
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs px-2"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      Marcar lida
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeNotification(notification.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      asChild
                    >
                      <Link href="/notifications">Ver todas as notificações</Link>
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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
                {/* 🆕 LINK PARA PERFIL ADICIONADO */}
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <FolderKanban className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
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