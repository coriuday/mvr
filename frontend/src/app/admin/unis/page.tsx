"use client";

import { useState, useCallback, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Trash2, Star, RefreshCw, AlertCircle, GraduationCap, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface University {
  id: string;
  name: string;
  country: string;
  ranking?: number;
  website_url?: string;
  is_featured: boolean;
}

const DEFAULT_FORM = { name: "", country: "", ranking: "", website_url: "", description: "", is_featured: false };

export default function AdminUnisPage() {
  const { token } = useAdminAuth();
  const [unis, setUnis] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchUnis = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/universities?per_page=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch universities");
      const data = await res.json();
      setUnis(data.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [token, API]);

  useEffect(() => { fetchUnis(); }, [fetchUnis]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`${API}/api/universities`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          country: form.country,
          ranking: form.ranking ? parseInt(form.ranking) : undefined,
          website_url: form.website_url || undefined,
          description: form.description || undefined,
          is_featured: form.is_featured,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create university");
      }
      setShowForm(false);
      setForm(DEFAULT_FORM);
      setSuccessMsg("University added successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchUnis();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    if (!token) return;
    await fetch(`${API}/api/universities/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ is_featured: !featured }),
    });
    fetchUnis();
  };

  const deleteUni = async (id: string) => {
    if (!token) return;
    await fetch(`${API}/api/universities/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleteConfirm(null);
    fetchUnis();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={fetchUnis}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a2f5e] text-sm transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
        <Button onClick={() => { setShowForm(true); setForm(DEFAULT_FORM); }}
          className="bg-[#1a2f5e] hover:bg-[#2a4a8e] text-white rounded-xl gap-2">
          <Plus size={15} /> Add University
        </Button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
          <Check size={15} /> {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-[#1a2f5e]">Add Partner University</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="uni-name" className="text-sm font-medium text-gray-700">University Name *</Label>
                <Input id="uni-name" placeholder="e.g. University of Toronto" value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required
                  className="rounded-xl h-11 border-gray-200" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="uni-country" className="text-sm font-medium text-gray-700">Country *</Label>
                <Input id="uni-country" placeholder="e.g. Canada" value={form.country}
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} required
                  className="rounded-xl h-11 border-gray-200" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="uni-ranking" className="text-sm font-medium text-gray-700">QS World Ranking</Label>
                <Input id="uni-ranking" type="number" placeholder="e.g. 21" value={form.ranking}
                  onChange={(e) => setForm((p) => ({ ...p, ranking: e.target.value }))}
                  className="rounded-xl h-11 border-gray-200" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="uni-website" className="text-sm font-medium text-gray-700">Website URL</Label>
                <Input id="uni-website" type="url" placeholder="https://www.university.edu" value={form.website_url}
                  onChange={(e) => setForm((p) => ({ ...p, website_url: e.target.value }))}
                  className="rounded-xl h-11 border-gray-200" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setForm((p) => ({ ...p, is_featured: !p.is_featured }))}
                  className={`w-11 h-6 rounded-full transition-colors relative ${form.is_featured ? "bg-[#c9a84c]" : "bg-gray-300"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_featured ? "translate-x-6" : "translate-x-1"}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Feature on homepage</span>
              </label>
            </div>
            {saveError && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{saveError}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}
                className="bg-[#1a2f5e] hover:bg-[#2a4a8e] text-white rounded-xl px-8 disabled:opacity-60">
                {saving ? "Adding…" : "Add University"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl border-gray-200">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <GraduationCap size={16} className="text-[#c9a84c]" />
          <span className="font-semibold text-[#1a2f5e] text-sm">{unis.length} Universit{unis.length !== 1 ? "ies" : "y"}</span>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : unis.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <GraduationCap size={32} className="text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm">No universities yet. Add your first partner!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {unis.map((uni) => (
              <div key={uni.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 bg-[#1a2f5e]/8 rounded-xl flex items-center justify-center shrink-0">
                  <GraduationCap size={18} className="text-[#1a2f5e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1a2f5e] truncate">{uni.name}</p>
                  <p className="text-gray-400 text-xs">{uni.country}{uni.ranking ? ` · QS #${uni.ranking}` : ""}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {uni.is_featured && (
                    <span className="bg-[#c9a84c]/15 text-[#a07a2e] text-xs font-semibold px-2.5 py-1 rounded-full">
                      ★ Featured
                    </span>
                  )}
                  <button onClick={() => toggleFeatured(uni.id, uni.is_featured)}
                    title={uni.is_featured ? "Remove from featured" : "Add to featured"}
                    className={`p-2 rounded-lg transition-colors ${uni.is_featured ? "text-[#c9a84c] bg-[#c9a84c]/10" : "text-gray-400 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10"}`}>
                    <Star size={15} />
                  </button>
                  {deleteConfirm === uni.id ? (
                    <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                      <span className="text-red-600 text-xs">Delete?</span>
                      <button onClick={() => deleteUni(uni.id)} className="text-red-600 font-bold text-xs">Yes</button>
                      <span className="text-red-300">|</span>
                      <button onClick={() => setDeleteConfirm(null)} className="text-gray-500 text-xs">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(uni.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
