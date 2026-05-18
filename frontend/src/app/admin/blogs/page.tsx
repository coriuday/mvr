"use client";

import { useState, useCallback, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Trash2, Edit2, Eye, EyeOff, RefreshCw, AlertCircle, FileText, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  published: boolean;
  tags: string[];
  created_at: string;
}

const DEFAULT_FORM = { title: "", slug: "", content: "", excerpt: "", tags: "", published: false };

export default function AdminBlogsPage() {
  const { user } = useAdminAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchBlogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      // Admin can see all blogs (published + drafts)
      const res = await fetch(`${API}/api/blogs?per_page=50`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      const data = await res.json();
      setBlogs(data.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [user, API]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setForm((p) => ({ ...p, title: value, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const body = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        excerpt: form.excerpt || undefined,
        published: form.published,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      const res = await fetch(`${API}/api/blogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create blog post");
      }
      setShowForm(false);
      setForm(DEFAULT_FORM);
      setSuccessMsg("Blog post created successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchBlogs();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (id: string, published: boolean) => {
    if (!user) return;
    await fetch(`${API}/api/blogs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ published: !published }),
    });
    fetchBlogs();
  };

  const deleteBlog = async (id: string) => {
    if (!user) return;
    await fetch(`${API}/api/blogs/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setDeleteConfirm(null);
    fetchBlogs();
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={fetchBlogs}
            className="flex items-center gap-2 text-gray-500 hover:text-[#1a2f5e] text-sm transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
        <Button onClick={() => { setShowForm(true); setForm(DEFAULT_FORM); }}
          className="bg-[#1a2f5e] hover:bg-[#2a4a8e] text-white rounded-xl gap-2">
          <Plus size={15} /> New Post
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

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-[#1a2f5e]">New Blog Post</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="blog-title" className="text-sm font-medium text-gray-700">Title *</Label>
                <Input id="blog-title" placeholder="Your compelling blog title" value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)} required
                  className="rounded-xl border-gray-200 h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="blog-slug" className="text-sm font-medium text-gray-700">Slug (URL)</Label>
                <Input id="blog-slug" placeholder="auto-generated-from-title" value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  className="rounded-xl border-gray-200 h-11 font-mono text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="blog-excerpt" className="text-sm font-medium text-gray-700">Excerpt</Label>
              <Input id="blog-excerpt" placeholder="Brief description shown in listings (1–2 sentences)" value={form.excerpt}
                onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                className="rounded-xl border-gray-200 h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="blog-tags" className="text-sm font-medium text-gray-700">Tags (comma-separated)</Label>
              <Input id="blog-tags" placeholder="e.g. UK, Visa, IELTS" value={form.tags}
                onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                className="rounded-xl border-gray-200 h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="blog-content" className="text-sm font-medium text-gray-700">
                Content * <span className="text-gray-400 font-normal">(Markdown supported)</span>
              </Label>
              <Textarea id="blog-content" rows={12} placeholder="## Introduction&#10;&#10;Write your content here using Markdown..."
                value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                required className="rounded-xl border-gray-200 resize-y font-mono text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div onClick={() => setForm((p) => ({ ...p, published: !p.published }))}
                  className={`w-11 h-6 rounded-full transition-colors relative ${form.published ? "bg-emerald-500" : "bg-gray-300"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.published ? "translate-x-6" : "translate-x-1"}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {form.published ? "Publish immediately" : "Save as draft"}
                </span>
              </label>
            </div>
            {saveError && (
              <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{saveError}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}
                className="bg-[#1a2f5e] hover:bg-[#2a4a8e] text-white rounded-xl px-8 disabled:opacity-60">
                {saving ? "Publishing…" : form.published ? "Publish Post" : "Save Draft"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}
                className="rounded-xl border-gray-200">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <FileText size={16} className="text-[#c9a84c]" />
          <span className="font-semibold text-[#1a2f5e] text-sm">{blogs.length} Blog Post{blogs.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <FileText size={32} className="text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm">No blog posts yet. Create your first post!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {blogs.map((blog) => (
              <div key={blog.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1a2f5e] truncate">{blog.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5 font-mono">/blogs/{blog.slug}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    blog.published ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {blog.published ? "Published" : "Draft"}
                  </span>
                  <button onClick={() => togglePublish(blog.id, blog.published)}
                    title={blog.published ? "Unpublish" : "Publish"}
                    className="p-2 text-gray-400 hover:text-[#1a2f5e] hover:bg-gray-100 rounded-lg transition-colors">
                    {blog.published ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  {deleteConfirm === blog.id ? (
                    <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                      <span className="text-red-600 text-xs">Confirm?</span>
                      <button onClick={() => deleteBlog(blog.id)}
                        className="text-red-600 hover:text-red-700 font-bold text-xs">Yes</button>
                      <span className="text-red-300">|</span>
                      <button onClick={() => setDeleteConfirm(null)}
                        className="text-gray-500 hover:text-gray-700 text-xs">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(blog.id)}
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
