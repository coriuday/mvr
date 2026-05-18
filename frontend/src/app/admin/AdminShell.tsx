"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, GraduationCap, FileText,
  Award, LogOut, Menu, X,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin",       icon: LayoutDashboard, label: "Dashboard",    color: "text-sky-400"   },
  { href: "/admin/leads", icon: Users,           label: "Leads",        color: "text-violet-400" },
  { href: "/admin/users", icon: GraduationCap,   label: "Staff Users",  color: "text-emerald-400" },
  { href: "/admin/blogs", icon: FileText,         label: "Blog Posts",   color: "text-amber-400"  },
  { href: "/admin/unis",  icon: Award,            label: "Universities", color: "text-rose-400"   },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAdminAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b1628] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f4f6fb]">

      {/* ── Mobile overlay ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-[#0b1628] transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:z-auto",
        open ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#a07a2e] flex items-center justify-center shadow-lg shadow-[#c9a84c]/20">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">MVR Consultants</p>
              <p className="text-white/35 text-[11px] mt-0.5">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-white/40 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest px-3 pb-3">Navigation</p>
          {NAV.map(({ href, icon: Icon, label, color }) => {
            const active = href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                <span className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                  active
                    ? "bg-[#c9a84c] text-white shadow-md shadow-[#c9a84c]/30"
                    : `bg-white/5 ${color} group-hover:bg-white/10`
                )}>
                  <Icon size={15} />
                </span>
                <span className="flex-1">{label}</span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl bg-white/[0.04]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a07a2e] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
              {user.name.charAt(0)}
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
        <header className="sticky top-0 z-20 flex items-center gap-4 bg-white/80 backdrop-blur-md border-b border-gray-200/70 px-5 py-3 shadow-sm">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1">
            <h1 className="font-bold text-[#0b1628] text-base capitalize leading-none">
              {pathname === "/admin"
                ? "Dashboard"
                : pathname.split("/admin/")[1]?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) ?? "Admin"}
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
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
          {children}
        </main>
      </div>
    </div>
  );
}
