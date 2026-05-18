"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Globe, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null);

  // Fetch blogs
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`);
      const data = await res.json();
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog?.title || !editingBlog?.content) return;

    const token = localStorage.getItem("admin_token");
    const isEditing = !!editingBlog.id;
    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${editingBlog.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/blogs`;

    try {
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingBlog.title,
          slug: editingBlog.slug || editingBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          content: editingBlog.content,
          excerpt: editingBlog.excerpt || "",
          cover_image: editingBlog.cover_image || null,
          author_name: editingBlog.author_name || "Admin",
          is_published: editingBlog.is_published || false,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingBlog(null);
        fetchBlogs();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Failed to save blog:", error);
      alert("Failed to save blog");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchBlogs();
      }
    } catch (error) {
      console.error("Failed to delete blog:", error);
    }
  };

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
            Blog Articles
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage public blog posts and articles.</p>
        </div>
        <Button 
          className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white"
          onClick={() => { setEditingBlog({ is_published: true }); setIsModalOpen(true); }}
        >
          <Plus size={16} className="mr-2" /> New Post
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between mb-6">
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search blogs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-lg h-9"
          />
        </div>
        <div className="text-sm text-gray-500">
          Total: <strong>{blogs.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
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
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading blogs...</td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No blogs found.</td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#1a2f5e]">{blog.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">/{blog.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{blog.author_name}</td>
                    <td className="px-6 py-4">
                      {blog.is_published ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-xs font-medium">
                          <Globe size={13} /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">
                          <EyeOff size={13} /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          onClick={() => { setEditingBlog(blog); setIsModalOpen(true); }}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(blog.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1a2f5e]">
              {editingBlog?.id ? "Edit Blog Post" : "Create New Post"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-5 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input 
                  value={editingBlog?.title || ""} 
                  onChange={e => setEditingBlog({...editingBlog, title: e.target.value})}
                  placeholder="E.g. Top 10 Universities in the US"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (auto-generated if empty)</Label>
                <Input 
                  value={editingBlog?.slug || ""} 
                  onChange={e => setEditingBlog({...editingBlog, slug: e.target.value})}
                  placeholder="top-10-universities-us"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Excerpt (Short summary)</Label>
              <Textarea 
                value={editingBlog?.excerpt || ""} 
                onChange={e => setEditingBlog({...editingBlog, excerpt: e.target.value})}
                placeholder="A brief summary for the blog listing page..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Content (Markdown) *</Label>
              <Textarea 
                value={editingBlog?.content || ""} 
                onChange={e => setEditingBlog({...editingBlog, content: e.target.value})}
                placeholder="Write your post here using Markdown..."
                rows={12}
                className="font-mono text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input 
                  value={editingBlog?.cover_image || ""} 
                  onChange={e => setEditingBlog({...editingBlog, cover_image: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Author Name</Label>
                <Input 
                  value={editingBlog?.author_name || ""} 
                  onChange={e => setEditingBlog({...editingBlog, author_name: e.target.value})}
                  placeholder="Author name"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="is_published"
                checked={editingBlog?.is_published || false}
                onChange={e => setEditingBlog({...editingBlog, is_published: e.target.checked})}
                className="rounded border-gray-300 text-[#c9a84c] focus:ring-[#c9a84c]"
              />
              <Label htmlFor="is_published" className="cursor-pointer">Publish immediately</Label>
            </div>

            <DialogFooter className="mt-8">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#1a2f5e] hover:bg-[#2a4a8e] text-white">Save Post</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
