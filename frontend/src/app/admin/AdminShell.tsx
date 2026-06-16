"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, GraduationCap, FileText,
  Award, LogOut, Menu, X, LayoutGrid, Globe, Mail,
  MessageSquare, BookOpen,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";

const NAV = [
  { href: "/admin",              icon: LayoutDashboard, label: "Dashboard",    group: "main"    },
  { href: "/admin/leads",        icon: LayoutGrid,      label: "Leads",        group: "main"    },
  { href: "/admin/users",        icon: Users,           label: "Staff Users",  group: "main"    },
  { href: "/admin/blogs",        icon: FileText,        label: "Blog Posts",   group: "content" },
  { href: "/admin/unis",         icon: GraduationCap,   label: "Universities", group: "content" },
  { href: "/admin/scholarships", icon: Award,           label: "Scholarships", group: "content" },
  { href: "/admin/testimonials", icon: MessageSquare,   label: "Testimonials", group: "content" },
  { href: "/admin/countries",    icon: Globe,           label: "Countries",    group: "data"    },
  { href: "/admin/newsletter",   icon: Mail,            label: "Newsletter",   group: "data"    },
];

const GROUPS = [
  { key: "main",    label: "Management"   },
  { key: "content", label: "Content"      },
  { key: "data",    label: "Data"         },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAdminAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#1a2f5e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/30 text-xs">Verifying session…</p>
        </div>
      </div>
    );
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
        "fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-[#1a2f5e] transition-transform duration-300 ease-in-out shadow-2xl",
        "lg:translate-x-0 lg:static lg:z-auto",
        open ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c9a84c] flex items-center justify-center shadow-lg shadow-[#c9a84c]/20">
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">MVR Admin</p>
              <p className="text-white/35 text-[11px] mt-0.5">Management Panel</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-white/40 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav — grouped */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {GROUPS.map((group) => {
            const items = NAV.filter((n) => n.group === group.key);
            return (
              <div key={group.key}>
                <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest px-3 pb-2">
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
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                          active
                            ? "bg-white/10 text-white"
                            : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                        )}
                      >
                        {/* Amber left border for active */}
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
                        <span className="flex-1">{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl bg-white/[0.04]">
            <div className="w-8 h-8 rounded-full bg-[#c9a84c] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-white text-sm font-semibold truncate leading-none">{user.name}</p>
              <p className="text-white/35 text-[11px] mt-0.5 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <LogOut size={14} />
            </span>
            Sign Out
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
          <AdminErrorBoundary section="Admin Panel">
            {children}
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
