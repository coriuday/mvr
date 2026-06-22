"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Download, Search, RefreshCw, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/services/api";

interface Subscriber {
  id: string;
  email: string;
  status: string;
  subscribed_at: string;
  created_at: string;
}

function isActiveStatus(status: string): boolean {
  return status.toLowerCase() === "active";
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-gray-50">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-3.5">
          <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
          <div className="h-5 bg-gray-100 rounded-full animate-pulse w-16" />
        </div>
      ))}
    </div>
  );
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [search, setSearch] = useState("");

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await api.get("/admin/newsletter");
      setSubscribers(res.data.data ?? []);
    } catch {
      setFetchError(true);
      toast.error("Failed to load subscribers — try refreshing the page");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const toExport = search.trim() ? filtered : subscribers;
    if (toExport.length === 0) {
      toast.error(
        fetchError
          ? "Subscribers could not be loaded — refresh and try again"
          : "No subscribers to export"
      );
      return;
    }
    const header = "Email,Status,Subscribed Date\n";
    const rows = toExport
      .map((s) => {
        const date = s.subscribed_at || s.created_at;
        return `"${s.email}","${s.status}","${new Date(date).toLocaleDateString()}"`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mvr-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${toExport.length} subscribers`);
  };

  const activeCount = subscribers.filter((s) => isActiveStatus(s.status)).length;
  const exportDisabled = loading || fetchError || subscribers.length === 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f5e]">Newsletter</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage email subscribers and export lists.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSubscribers}
            className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={exportCSV}
            disabled={exportDisabled}
            className="flex items-center gap-2 bg-[#1a2f5e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0f1c3d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1a2f5e]/10 flex items-center justify-center shrink-0">
            <Users size={18} className="text-[#1a2f5e]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1a2f5e]">{subscribers.length}</p>
            <p className="text-gray-500 text-xs">Total Subscribers</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Mail size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1a2f5e]">{activeCount}</p>
            <p className="text-gray-500 text-xs">Active</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <Mail size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1a2f5e]">{subscribers.length - activeCount}</p>
            <p className="text-gray-500 text-xs">Unsubscribed</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Filter by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <p className="text-sm text-gray-500 shrink-0">
          {filtered.length} of <strong>{subscribers.length}</strong>
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/70 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3}><TableSkeleton /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-gray-400">
                    {fetchError
                      ? "Could not load subscribers. Click refresh to try again."
                      : search
                        ? "No subscribers match your filter."
                        : "No subscribers yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-[#1a2f5e]">{s.email}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isActiveStatus(s.status) ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActiveStatus(s.status) ? "bg-emerald-500" : "bg-red-400"}`} />
                        {isActiveStatus(s.status) ? "Active" : "Unsubscribed"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-400 text-xs">
                      {new Date(s.subscribed_at || s.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
