"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Search, RefreshCw, Trash2, Edit2, ChevronLeft,
  ChevronRight, AlertCircle, Users, Clock, Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country_interest?: string;
  message?: string;
  status: string;
  source: string;
  created_at: string;
  notes?: string;
}

const STATUSES = ["ALL", "NEW", "CONTACTED", "IN_PROGRESS", "CONVERTED", "REJECTED"];

const STATUS_COLORS: Record<string, string> = {
  NEW:         "bg-blue-100 text-blue-700",
  CONTACTED:   "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  CONVERTED:   "bg-emerald-100 text-emerald-700",
  REJECTED:    "bg-red-100 text-red-700",
};

export default function LeadsPage() {
  const { token } = useAdminAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const PER_PAGE = 15;
  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchLeads = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(PER_PAGE) });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`${API}/api/leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load leads");
      const data = await res.json();
      setLeads(data.data ?? []);
      setTotal(data.meta?.total ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, API]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateStatus = async (id: string, status: string) => {
    if (!token) return;
    setUpdating(true);
    try {
      await fetch(`${API}/api/leads/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchLeads();
      if (selected?.id === id) setSelected((p) => p ? { ...p, status } : p);
    } finally {
      setUpdating(false);
    }
  };

  const deleteLead = async (id: string) => {
    if (!token) return;
    await fetch(`${API}/api/leads/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleteConfirm(null);
    if (selected?.id === id) setSelected(null);
    fetchLeads();
  };

  const totalPages = Math.ceil(total / PER_PAGE);
  const filtered = search
    ? leads.filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()))
    : leads;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search by name or email…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-gray-200 h-10" />
        </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v || ""); setPage(1); }}>
          <SelectTrigger className="w-44 rounded-xl border-gray-200 h-10">
            <Filter size={14} className="mr-1.5 text-gray-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "ALL" ? "All Statuses" : s.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <button onClick={fetchLeads}
          className="flex items-center gap-2 bg-[#1a2f5e] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#2a4a8e] transition-colors">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#c9a84c]" />
              <span className="font-semibold text-[#1a2f5e] text-sm">
                {total} Lead{total !== 1 ? "s" : ""}
              </span>
            </div>
            <span className="text-gray-400 text-xs">Page {page} of {totalPages || 1}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Users size={32} className="text-gray-200 mb-2" />
              <p className="text-gray-400 text-sm">No leads found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setSelected(lead)}
                  className={`px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-4 ${
                    selected?.id === lead.id ? "bg-blue-50/50 border-l-2 border-[#c9a84c]" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#1a2f5e]/10 flex items-center justify-center text-[#1a2f5e] font-bold text-sm shrink-0">
                    {lead.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1a2f5e] text-sm truncate">{lead.name}</p>
                    <p className="text-gray-400 text-xs truncate">{lead.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {lead.status.replace("_", " ")}
                    </span>
                    <p className="text-gray-300 text-xs mt-1 flex items-center gap-1 justify-end">
                      <Clock size={10} />
                      {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a2f5e] disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={15} /> Prev
              </button>
              <span className="text-xs text-gray-400">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a2f5e] disabled:opacity-40 disabled:cursor-not-allowed">
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Edit2 size={28} className="text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Select a lead to view details</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1a2f5e]/10 flex items-center justify-center text-[#1a2f5e] font-bold">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[#1a2f5e]">{selected.name}</h3>
                  <p className="text-gray-400 text-xs">{selected.source}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { label: "Email",   value: selected.email },
                  { label: "Phone",   value: selected.phone ?? "—" },
                  { label: "Country", value: selected.country_interest ?? "—" },
                  { label: "Received", value: new Date(selected.created_at).toLocaleString("en-IN") },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-400 font-medium">{label}</span>
                    <span className="text-[#1a2f5e] text-right max-w-[60%] break-words">{value}</span>
                  </div>
                ))}
              </div>

              {selected.message && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs font-medium mb-1">Message</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{selected.message}</p>
                </div>
              )}

              {/* Status Update */}
              <div className="space-y-2">
                <p className="text-gray-400 text-xs font-medium">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.filter((s) => s !== "ALL").map((s) => (
                    <button key={s}
                      disabled={updating || selected.status === s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        selected.status === s
                          ? (STATUS_COLORS[s] ?? "bg-gray-100 text-gray-600") + " ring-2 ring-offset-1 ring-current"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      } disabled:opacity-60`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delete */}
              {deleteConfirm === selected.id ? (
                <div className="bg-red-50 rounded-xl p-3 space-y-2">
                  <p className="text-red-600 text-xs font-medium">Delete this lead?</p>
                  <div className="flex gap-2">
                    <button onClick={() => deleteLead(selected.id)}
                      className="flex-1 bg-red-600 text-white text-xs py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                      Confirm Delete
                    </button>
                    <button onClick={() => setDeleteConfirm(null)}
                      className="flex-1 bg-gray-100 text-gray-600 text-xs py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(selected.id)}
                  className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-sm transition-colors">
                  <Trash2 size={14} /> Delete Lead
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
