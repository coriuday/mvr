"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, GraduationCap, FileText,
  Award, LogOut, Menu, X, LayoutGrid, Globe,
  MessageSquare, BookOpen, PanelLeftClose, PanelLeft,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";

const SIDEBAR_COLLAPSED_KEY = "mvr_admin_sidebar_collapsed";

const NAV = [
  { href: "/admin",              icon: LayoutDashboard, label: "Dashboard",    group: "main"    },
  { href: "/admin/leads",        icon: LayoutGrid,      label: "Leads",        group: "main"    },
  { href: "/admin/users",        icon: Users,           label: "Staff Users",  group: "main"    },
  { href: "/admin/blogs",        icon: FileText,        label: "Blog Posts",   group: "content" },
  { href: "/admin/unis",         icon: GraduationCap,   label: "Universities", group: "content" },
  { href: "/admin/scholarships", icon: Award,           label: "Scholarships", group: "content" },
  { href: "/admin/testimonials", icon: MessageSquare,   label: "Testimonials", group: "content" },
  { href: "/admin/countries",    icon: Globe,           label: "Countries",    group: "data"    },
];

const GROUPS = [
  { key: "main",    label: "Management"   },
  { key: "content", label: "Content"      },
  { key: "data",    label: "Data"         },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, isVerifying, verifyError, logout, retryVerify } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // Safety net: if verification never resolves, redirect to login.
  useEffect(() => {
    if (pathname === "/admin/login") return;
    const timeout = setTimeout(() => {
      if (isVerifying && !user) router.replace("/admin/login");
    }, 15_000);
    return () => clearTimeout(timeout);
  }, [isVerifying, user, router, pathname]);

  if (pathname === "/admin/login") return <>{children}</>;

  if (!user && (loading || isVerifying)) {
    return (
      <div className="min-h-screen bg-[#1a2f5e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/50 text-xs tracking-wide">Verifying session…</p>
          <p className="text-white/30 text-[11px] max-w-xs text-center">
            First load can take a moment while the API wakes up.
          </p>
          <button
            type="button"
            onClick={retryVerify}
            className="mt-2 text-xs text-[#c9a84c] hover:text-white border border-[#c9a84c]/40 px-4 py-2 rounded-lg transition-colors"
          >
            Retry connection
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#f0f4fc]">

      {/* ── Mobile overlay ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-[#1a2f5e] shadow-2xl",
        "transition-[width,transform] duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:z-auto",
        open ? "translate-x-0 w-64" : "-translate-x-full w-64",
        collapsed ? "lg:w-[4.5rem]" : "lg:w-64"
      )}>

        {/* Logo */}
        <div className={cn(
          "flex items-center border-b border-white/[0.08] py-5",
          collapsed ? "lg:justify-center lg:px-2 px-5 justify-between" : "justify-between px-5"
        )}>
          <div className={cn("flex items-center gap-3", collapsed && "lg:gap-0")}>
            <div className="w-9 h-9 rounded-xl bg-[#c9a84c] flex items-center justify-center shadow-lg shadow-[#c9a84c]/20 flex-shrink-0">
              <BookOpen size={16} className="text-white" />
            </div>
            <div className={cn(collapsed && "lg:hidden")}>
              <p className="text-white font-bold text-sm leading-none">MVR Admin</p>
              <p className="text-white/35 text-[11px] mt-0.5">Management Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleCollapsed}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <button onClick={() => setOpen(false)} className="lg:hidden text-white/40 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav — grouped */}
        <nav className={cn(
          "flex-1 overflow-y-auto py-4 space-y-5",
          collapsed ? "lg:px-2 px-3" : "px-3"
        )}>
          {GROUPS.map((group) => {
            const items = NAV.filter((n) => n.group === group.key);
            return (
              <div key={group.key}>
                <p className={cn(
                  "text-white/25 text-[10px] font-semibold uppercase tracking-widest px-3 pb-2",
                  collapsed && "lg:hidden"
                )}>
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {items.map(({ href, icon: Icon, label }) => {
                    const active =
                      href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        title={label}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center rounded-xl text-sm font-medium transition-all duration-150 group relative",
                          collapsed ? "lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2.5 gap-3" : "gap-3 px-3 py-2.5",
                          active
                            ? "bg-white/10 text-white"
                            : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#c9a84c] rounded-r-full" />
                        )}
                        <span className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                          active
                            ? "bg-[#c9a84c] text-white shadow-md shadow-[#c9a84c]/30"
                            : "bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white"
                        )}>
                          <Icon size={15} />
                        </span>
                        <span className={cn("flex-1", collapsed && "lg:hidden")}>{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className={cn(
          "border-t border-white/[0.06] pt-3 pb-4",
          collapsed ? "lg:px-2 px-3" : "px-3"
        )}>
          <div className={cn(
            "flex items-center mb-1 rounded-xl bg-white/[0.04]",
            collapsed ? "lg:justify-center lg:px-0 lg:py-2 gap-3 px-3 py-2.5" : "gap-3 px-3 py-2.5"
          )}>
            <div
              className="w-8 h-8 rounded-full bg-[#c9a84c] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md"
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={cn("overflow-hidden flex-1", collapsed && "lg:hidden")}>
              <p className="text-white text-sm font-semibold truncate leading-none">{user.name}</p>
              <p className="text-white/35 text-[11px] mt-0.5 truncate">{user.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Sign Out"
            className={cn(
              "w-full flex items-center text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all",
              collapsed ? "lg:justify-center lg:px-0 lg:py-2.5 gap-3 px-3 py-2.5" : "gap-3 px-3 py-2.5"
            )}
          >
            <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <LogOut size={14} />
            </span>
            <span className={collapsed ? "lg:hidden" : ""}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">

        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-4 bg-white/90 backdrop-blur-md border-b border-gray-200/70 px-5 py-3 shadow-sm">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>

          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>

          <div className="flex-1">
            <h1 className="font-bold text-[#1a2f5e] text-base capitalize leading-none">
              {pathname === "/admin"
                ? "Dashboard"
                : pathname.split("/admin/")[1]?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Admin"}
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {verifyError && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span>Could not verify session with the server. Showing cached login — some data may be stale.</span>
              <button
                type="button"
                onClick={retryVerify}
                className="shrink-0 font-semibold text-[#1a2f5e] hover:underline"
              >
                Retry
              </button>
            </div>
          )}
          <AdminErrorBoundary section="Admin Panel">
            {children}
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
