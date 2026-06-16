"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Globe, EyeOff, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { toast } from "sonner";
import api from "@/services/api";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  author_name: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

type BlogDraft = Partial<Blog>;

// ── Loading skeleton ──────────────────────────────────────────────────────────
function BlogSkeleton() {
  return (
    <div className="divide-y divide-gray-50">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
          </div>
          <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
          <div className="h-6 bg-gray-100 rounded-full animate-pulse w-20" />
          <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-100 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/blogs");
      setBlogs(res.data.data ?? []);
    } catch {
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog?.title?.trim() || !editingBlog?.content?.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    const isEditing = !!editingBlog.id;
    try {
      if (isEditing) {
        await api.put(`/blogs/${editingBlog.id}`, {
          title: editingBlog.title,
          slug: editingBlog.slug || editingBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          content: editingBlog.content,
          excerpt: editingBlog.excerpt || "",
          cover_image: editingBlog.cover_image || null,
          author_name: editingBlog.author_name || "Admin",
          is_published: editingBlog.is_published ?? false,
        });
      } else {
        await api.post("/blogs", {
          title: editingBlog.title,
          slug: editingBlog.slug || editingBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          content: editingBlog.content,
          excerpt: editingBlog.excerpt || "",
          cover_image: editingBlog.cover_image || null,
          author_name: editingBlog.author_name || "Admin",
          is_published: editingBlog.is_published ?? false,
        });
      }
      toast.success(isEditing ? "Blog post updated" : "Blog post created");
      setIsModalOpen(false);
      setEditingBlog(null);
      fetchBlogs();
    } catch (err: unknown) {
      const ae = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(ae.response?.data?.error?.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/blogs/${deleteTarget}`);
      toast.success("Blog post deleted");
      setDeleteTarget(null);
      fetchBlogs();
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => {
    setEditingBlog({ is_published: true, author_name: "MVR Consultants" });
    setIsModalOpen(true);
  };

  const filteredBlogs = blogs.filter((b) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f5e]">Blog Articles</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage public blog posts and articles.</p>
        </div>
        <Button className="bg-[#1a2f5e] hover:bg-[#0f1c3d] text-white" onClick={openCreate}>
          <Plus size={16} className="mr-2" /> New Post
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by title or author…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <p className="text-sm text-gray-500 shrink-0">
          {filteredBlogs.length} of <strong>{blogs.length}</strong> posts
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/70 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Author</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}><BlogSkeleton /></td></tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    {searchTerm ? "No posts match your search." : "No blog posts yet. Create your first post!"}
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {blog.cover_image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={blog.cover_image} alt="" className="w-10 h-7 object-cover rounded-md shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold text-[#1a2f5e] truncate max-w-[260px]">{blog.title}</p>
                          <p className="text-gray-400 text-xs mt-0.5">/{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{blog.author_name}</td>
                    <td className="px-6 py-4">
                      {blog.is_published ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <Globe size={11} /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <EyeOff size={11} /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(blog.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingBlog(blog); setIsModalOpen(true); }}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-[#1a2f5e] hover:bg-[#1a2f5e]/10 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(blog.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={(o) => { if (!saving) { setIsModalOpen(o); if (!o) setEditingBlog(null); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1a2f5e]">
              {editingBlog?.id ? "Edit Blog Post" : "Create New Post"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-5 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Title *</Label>
                <Input
                  value={editingBlog?.title || ""}
                  onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                  placeholder="Top 10 Universities in the US"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug <span className="text-gray-400 font-normal">(auto-generated)</span></Label>
                <Input
                  value={editingBlog?.slug || ""}
                  onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                  placeholder="top-10-universities-us"
                />
              </div>
            </div>

            {/* Cover image — Cloudinary upload (Task 2) */}
            <CloudinaryImageUpload
              label="Cover Image"
              value={editingBlog?.cover_image || ""}
              onChange={(url) => setEditingBlog({ ...editingBlog, cover_image: url })}
              folder="mvr/blogs"
              aspectRatio="video"
            />

            <div className="space-y-1.5">
              <Label>Excerpt</Label>
              <Textarea
                value={editingBlog?.excerpt || ""}
                onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                placeholder="A brief summary for the blog listing page…"
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Content (Markdown) *</Label>
              <Textarea
                value={editingBlog?.content || ""}
                onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                placeholder="Write your post here using Markdown…"
                rows={12}
                className="font-mono text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Author Name</Label>
              <Input
                value={editingBlog?.author_name || ""}
                onChange={(e) => setEditingBlog({ ...editingBlog, author_name: e.target.value })}
                placeholder="MVR Consultants"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={editingBlog?.is_published ?? false}
                onChange={(e) => setEditingBlog({ ...editingBlog, is_published: e.target.checked })}
                className="rounded border-gray-300 text-[#c9a84c] focus:ring-[#c9a84c]"
              />
              <span className="text-sm font-medium text-gray-700">Publish immediately</span>
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1a2f5e] hover:bg-[#0f1c3d] text-white" disabled={saving}>
                {saving ? <><Loader2 size={14} className="mr-2 animate-spin" /> Saving…</> : "Save Post"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Blog Post?"
        message="This will permanently remove the post and cannot be undone."
        confirmLabel="Delete Post"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
