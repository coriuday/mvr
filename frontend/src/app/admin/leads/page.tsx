"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import api from "@/services/api";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search, RefreshCw, AlertCircle, LayoutGrid, List,
  GripVertical, X, Phone, Mail, Globe, Clock,
  MessageSquare, Trash2, ChevronDown, StickyNote,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country_interest?: string;
  message?: string;
  status: LeadStatus;
  source: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  assigned_to?: string | null;
  assigned_name?: string | null; // resolved from staff list
}

interface Counselor {
  id: string;
  name: string;
  email: string;
  role: string;
}

type LeadStatus = "NEW" | "CONTACTED" | "IN_PROGRESS" | "CONVERTED" | "REJECTED";

/** Normalize API status values (PascalCase legacy) to pipeline keys */
function normalizeLead(raw: Lead): Lead {
  const statusMap: Record<string, LeadStatus> = {
    New: "NEW",
    Contacted: "CONTACTED",
    InProgress: "IN_PROGRESS",
    Converted: "CONVERTED",
    Rejected: "REJECTED",
    NEW: "NEW",
    CONTACTED: "CONTACTED",
    IN_PROGRESS: "IN_PROGRESS",
    CONVERTED: "CONVERTED",
    REJECTED: "REJECTED",
  };
  return { ...raw, status: statusMap[raw.status] ?? "NEW" };
}

// ─── Pipeline config (single source of truth for all columns) ─────────────────

export const PIPELINE: {
  status:      LeadStatus;
  label:       string;
  color:       string;         // Tailwind bg for the column header dot
  headerBg:    string;         // subtle column header bg
  cardBorder:  string;         // left border on card
  badge:       string;         // badge classes
}[] = [
  {
    status:     "NEW",
    label:      "New",
    color:      "bg-sky-400",
    headerBg:   "bg-sky-50",
    cardBorder: "border-l-sky-400",
    badge:      "bg-sky-100 text-sky-700",
  },
  {
    status:     "CONTACTED",
    label:      "Contacted",
    color:      "bg-violet-400",
    headerBg:   "bg-violet-50",
    cardBorder: "border-l-violet-400",
    badge:      "bg-violet-100 text-violet-700",
  },
  {
    status:     "IN_PROGRESS",
    label:      "In Progress",
    color:      "bg-amber-400",
    headerBg:   "bg-amber-50",
    cardBorder: "border-l-amber-400",
    badge:      "bg-amber-100 text-amber-700",
  },
  {
    status:     "CONVERTED",
    label:      "Converted",
    color:      "bg-emerald-400",
    headerBg:   "bg-emerald-50",
    cardBorder: "border-l-emerald-400",
    badge:      "bg-emerald-100 text-emerald-700",
  },
  {
    status:     "REJECTED",
    label:      "Rejected",
    color:      "bg-red-400",
    headerBg:   "bg-red-50",
    cardBorder: "border-l-red-400",
    badge:      "bg-red-100 text-red-700",
  },
];

const colByStatus = Object.fromEntries(PIPELINE.map((c) => [c.status, c])) as Record<LeadStatus, typeof PIPELINE[0]>;

// ─── Lead Detail Modal ────────────────────────────────────────────────────────

function LeadModal({
  lead,
  onClose,
  onUpdate,
  onDelete,
  counselors,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Pick<Lead, "status" | "notes"> & { assigned_to?: string | null }>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  counselors: Counselor[];
}) {
  const [notes, setNotes]     = useState(lead.notes ?? "");
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  async function saveNotes() {
    setSaving(true);
    await onUpdate(lead.id, { notes });
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    await onDelete(lead.id);
  }

  const col = colByStatus[lead.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-start gap-4 p-6 border-b border-gray-100 ${col.headerBg} rounded-t-3xl`}>
          <div className="w-12 h-12 rounded-2xl bg-[#1a2f5e]/10 flex items-center justify-center text-[#1a2f5e] font-bold text-lg shrink-0">
            {lead.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-[#1a2f5e] text-lg leading-tight truncate">{lead.name}</h2>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${col.badge}`}>
              {col.label}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Contact info */}
          <div className="space-y-2.5">
            {[
              { icon: Mail,  label: "Email",   value: lead.email,            href: `mailto:${lead.email}` },
              { icon: Phone, label: "Phone",   value: lead.phone ?? "—",     href: lead.phone ? `tel:${lead.phone}` : undefined },
              { icon: Globe, label: "Country", value: lead.country_interest ?? "—", href: undefined },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon size={13} className="text-gray-500" />
                </span>
                <span className="text-gray-400 w-14 shrink-0">{label}</span>
                {href ? (
                  <a href={href} className="text-[#1a2f5e] hover:text-[#c9a84c] font-medium truncate transition-colors">{value}</a>
                ) : (
                  <span className="text-[#1a2f5e] font-medium truncate">{value}</span>
                )}
              </div>
            ))}
            <div className="flex items-start gap-3 text-sm">
              <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                <Clock size={13} className="text-gray-500" />
              </span>
              <span className="text-gray-400 w-14 shrink-0">Received</span>
              <span className="text-gray-600">{new Date(lead.created_at).toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={13} className="text-gray-400" />
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Message</p>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{lead.message}</p>
            </div>
          )}

          {/* Status buttons */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Move to Stage</p>
            <div className="flex flex-wrap gap-2">
              {PIPELINE.map((col) => (
                <button
                  key={col.status}
                  disabled={saving || lead.status === col.status}
                  onClick={async () => { setSaving(true); await onUpdate(lead.id, { status: col.status }); setSaving(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    lead.status === col.status
                      ? col.badge + " ring-2 ring-offset-1 ring-current scale-105"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  } disabled:opacity-50`}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assign to counselor (Task 9) */}
          {counselors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assign To</p>
              <select
                value={lead.assigned_to ?? ""}
                disabled={saving}
                onChange={async (e) => {
                  const val = e.target.value || null;
                  setSaving(true);
                  await onUpdate(lead.id, { assigned_to: val });
                  setSaving(false);
                }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20"
              >
                <option value="">— Unassigned —</option>
                {counselors.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StickyNote size={13} className="text-gray-400" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Internal Notes</p>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this lead…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 resize-none"
            />
            <button
              onClick={saveNotes}
              disabled={saving || notes === (lead.notes ?? "")}
              className="mt-2 px-4 py-2 bg-[#1a2f5e] text-white rounded-xl text-xs font-semibold disabled:opacity-40 hover:bg-[#2a4a8e] transition-colors"
            >
              {saving ? "Saving…" : "Save Notes"}
            </button>
          </div>

          {/* Delete */}
          {confirmDel ? (
            <div className="bg-red-50 rounded-2xl p-4 space-y-3">
              <p className="text-red-600 text-sm font-semibold">Permanently delete this lead?</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 bg-red-600 text-white text-sm py-2 rounded-xl font-semibold disabled:opacity-60 hover:bg-red-700 transition-colors">
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </button>
                <button onClick={() => setConfirmDel(false)}
                  className="flex-1 bg-gray-100 text-gray-600 text-sm py-2 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)}
              className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-sm transition-colors">
              <Trash2 size={14} /> Delete Lead
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function LeadCard({
  lead,
  onDragStart,
  onClick,
  col,
}: {
  lead: Lead;
  col: typeof PIPELINE[0];
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onClick: (lead: Lead) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onClick={() => onClick(lead)}
      className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${col.cardBorder} p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-150 select-none group`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#1a2f5e]/8 flex items-center justify-center text-[#1a2f5e] font-bold text-sm shrink-0">
            {lead.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#1a2f5e] text-sm truncate">{lead.name}</p>
            <p className="text-gray-400 text-xs truncate">{lead.email}</p>
          </div>
        </div>
        <GripVertical size={14} className="text-gray-300 group-hover:text-gray-400 shrink-0 mt-1 transition-colors" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {lead.country_interest && (
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
            <Globe size={9} /> {lead.country_interest}
          </span>
        )}
        {lead.notes && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
            <StickyNote size={9} /> Note
          </span>
        )}
      </div>

      <p className="text-gray-300 text-[11px] mt-2 flex items-center gap-1">
        <Clock size={9} />
        {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
      </p>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  col,
  leads,
  onDragStart,
  onDrop,
  onCardClick,
  isDragOver,
  onDragOver,
  onDragLeave,
}: {
  col: typeof PIPELINE[0];
  leads: Lead[];
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onDrop: (e: React.DragEvent, status: LeadStatus) => void;
  onCardClick: (lead: Lead) => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
}) {
  return (
    <div className="flex flex-col min-w-[260px] flex-1 max-w-[320px]">
      {/* Column Header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-2xl mb-3 ${col.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
          <span className="font-bold text-[#1a2f5e] text-sm">{col.label}</span>
        </div>
        <span className={`min-w-6 h-6 px-1.5 rounded-lg ${col.badge} text-xs font-bold flex items-center justify-center`}>
          {leads.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, col.status)}
        className={`flex-1 rounded-2xl transition-all duration-150 min-h-[200px] space-y-2.5 p-2 ${
          isDragOver
            ? "bg-[#1a2f5e]/5 ring-2 ring-[#1a2f5e]/20 ring-dashed"
            : "bg-gray-50/60"
        }`}
      >
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            col={col}
            onDragStart={onDragStart}
            onClick={onCardClick}
          />
        ))}
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-24 text-gray-300 text-xs">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}

// ─── List Row (for list view) ─────────────────────────────────────────────────

function LeadRow({ lead, onClick }: { lead: Lead; onClick: (l: Lead) => void }) {
  const col = colByStatus[lead.status];
  return (
    <div
      onClick={() => onClick(lead)}
      className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
    >
      <div className="w-8 h-8 rounded-full bg-[#1a2f5e]/10 flex items-center justify-center text-[#1a2f5e] font-bold text-sm shrink-0">
        {lead.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-4 gap-2 items-center">
        <div className="min-w-0 col-span-1">
          <p className="font-medium text-[#1a2f5e] text-sm truncate">{lead.name}</p>
          <p className="text-gray-400 text-xs truncate">{lead.email}</p>
        </div>
        <p className="text-gray-500 text-sm truncate hidden sm:block">{lead.country_interest ?? "—"}</p>
        <p className="text-gray-400 text-xs hidden md:block">{lead.source.replace(/_/g, " ")}</p>
        <div className="flex items-center justify-end gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${col.badge}`}>
            {col.label}
          </span>
          <span className="text-gray-300 text-xs hidden lg:block">
            {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline Stats Bar ───────────────────────────────────────────────────────

function PipelineStats({ leads }: { leads: Lead[] }) {
  const total = leads.length || 1;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-[#1a2f5e]">Pipeline Overview</p>
        <p className="text-xs text-gray-400">{leads.length} total leads</p>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-0.5">
        {PIPELINE.map((col) => {
          const count = leads.filter((l) => l.status === col.status).length;
          const pct   = (count / total) * 100;
          return pct > 0 ? (
            <div
              key={col.status}
              title={`${col.label}: ${count}`}
              className={`${col.color} transition-all duration-700`}
              style={{ width: `${pct}%` }}
            />
          ) : null;
        })}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {PIPELINE.map((col) => {
          const count = leads.filter((l) => l.status === col.status).length;
          return (
            <div key={col.status} className="text-center">
              <p className="text-lg font-bold text-[#1a2f5e]">{count}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
                <p className="text-[10px] text-gray-400 leading-none">{col.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PER_PAGE = 50;

export default function LeadsPage() {
  useAdminAuth();

  const [leads, setLeads]         = useState<Lead[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 300);
  const [view, setView]           = useState<"kanban" | "list">("kanban");
  const [selected, setSelected]   = useState<Lead | null>(null);
  const [dragOver, setDragOver]   = useState<LeadStatus | null>(null);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const dragLeadRef = useRef<Lead | null>(null);

  // Fetch counselors for assignment dropdown (Task 9)
  useEffect(() => {
    api.get("/admin/users").then((r) => {
      const all: Counselor[] = r.data.data ?? [];
      setCounselors(all.filter((u) => u.role !== "ADMIN"));
    }).catch(() => {});
  }, []);

  // Paginated fetch (Task 10)
  const fetchLeads = useCallback(async (p = 1, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    setError("");
    try {
      const res = await api.get(`/leads?per_page=${PER_PAGE}&page=${p}`);
      const incoming: Lead[] = (res.data.data ?? []).map(normalizeLead);
      const tot: number = res.data.meta?.total ?? incoming.length;
      setTotal(tot);
      setLeads((prev) => append ? [...prev, ...incoming] : incoming);
      setPage(p);
    } catch (e: unknown) {
      const ae = e as { response?: { data?: { error?: { message?: string } } } };
      setError(ae.response?.data?.error?.message ?? "Failed to load leads");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchLeads(1, false); }, [fetchLeads]);

  // Optimistic update (status, notes, assigned_to)
  const updateLead = useCallback(async (id: string, patch: Partial<Pick<Lead, "status" | "notes"> & { assigned_to?: string | null }>) => {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, ...patch } : l));
    setSelected((prev) => prev?.id === id ? { ...prev, ...patch } : prev);
    try {
      await api.put(`/leads/${id}`, patch);
    } catch {
      fetchLeads(1, false);
    }
  }, [fetchLeads]);

  const deleteLead = useCallback(async (id: string) => {
    const previous = leads;
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSelected(null);
    try {
      await api.delete(`/leads/${id}`);
      toast.success("Lead deleted");
    } catch {
      setLeads(previous);
      toast.error("Failed to delete lead");
    }
  }, [leads]);

  // ── Drag & Drop ────────────────────────────────────────────────────────────

  function handleDragStart(e: React.DragEvent, lead: Lead) {
    dragLeadRef.current = lead;
    e.dataTransfer.effectAllowed = "move";
    // Minimal ghost — browsers create one automatically from the element
  }

  function handleDragOver(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(status);
  }

  async function handleDrop(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault();
    setDragOver(null);
    const lead = dragLeadRef.current;
    if (!lead || lead.status === status) return;
    await updateLead(lead.id, { status });
    dragLeadRef.current = null;
  }

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = search.trim()
    ? leads.filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        (l.country_interest ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : leads;

  function leadsFor(status: LeadStatus) {
    return filtered.filter((l) => l.status === status);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search name, email, country…"
            value={searchRaw}
            onChange={(e) => setSearchRaw(e.target.value)}
            className="pl-9 rounded-xl border-gray-200 h-10"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              view === "kanban" ? "bg-white shadow-sm text-[#1a2f5e]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <LayoutGrid size={13} /> Kanban
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              view === "list" ? "bg-white shadow-sm text-[#1a2f5e]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <List size={13} /> List
          </button>
        </div>

        <button
          onClick={() => fetchLeads(1, false)}
          className="flex items-center gap-2 bg-[#1a2f5e] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#2a4a8e] transition-colors"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <>
          {/* Pipeline stats */}
          <PipelineStats leads={filtered} />

          {/* Kanban / List */}
          {view === "kanban" ? (
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ alignItems: "flex-start" }}>
              {PIPELINE.map((col) => (
                <KanbanColumn
                  key={col.status}
                  col={col}
                  leads={leadsFor(col.status)}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  onCardClick={setSelected}
                  isDragOver={dragOver === col.status}
                  onDragOver={(e) => handleDragOver(e, col.status)}
                  onDragLeave={() => setDragOver(null)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* List header */}
              <div className="grid grid-cols-4 gap-2 px-5 py-3 bg-gray-50 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <span>Name</span>
                <span className="hidden sm:block">Country</span>
                <span className="hidden md:block">Source</span>
                <span className="text-right">Status</span>
              </div>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-300 text-sm">
                  No leads found
                </div>
              ) : (
                <div>
                  {filtered.map((lead) => (
                    <LeadRow key={lead.id} lead={lead} onClick={setSelected} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Load More (Task 10) */}
      {!loading && leads.length < total && (
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-sm text-gray-400">Showing {leads.length} of {total} leads</p>
          <button
            onClick={() => fetchLeads(page + 1, true)}
            disabled={loadingMore}
            className="flex items-center gap-2 bg-white border border-gray-200 text-[#1a2f5e] px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a2f5e] hover:text-white hover:border-[#1a2f5e] transition-all disabled:opacity-50"
          >
            {loadingMore ? <><div className="w-4 h-4 border-2 border-[#1a2f5e] border-t-transparent rounded-full animate-spin" /> Loading…</> : "Load More Leads"}
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <LeadModal
            lead={selected}
            onClose={() => setSelected(null)}
            onUpdate={updateLead}
            onDelete={deleteLead}
            counselors={counselors}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
