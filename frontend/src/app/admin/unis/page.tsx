"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, MapPin, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface University {
  id: string;
  name: string;
  country: string;
  ranking: number | null;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  is_featured: boolean;
  created_at: string;
}

export default function AdminUnisPage() {
  const [unis, setUnis] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUni, setEditingUni] = useState<Partial<University> | null>(null);

  // Fetch universities
  useEffect(() => {
    fetchUnis();
  }, []);

  const fetchUnis = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/universities`);
      const data = await res.json();
      if (data.success) {
        setUnis(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch universities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUni?.name || !editingUni?.country) return;

    const token = localStorage.getItem("admin_token");
    const isEditing = !!editingUni.id;
    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/universities/${editingUni.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/universities`;

    try {
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingUni.name,
          country: editingUni.country,
          ranking: editingUni.ranking ? parseInt(editingUni.ranking.toString()) : null,
          logo_url: editingUni.logo_url || null,
          description: editingUni.description || null,
          website_url: editingUni.website_url || null,
          is_featured: editingUni.is_featured || false,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingUni(null);
        fetchUnis();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Failed to save university:", error);
      alert("Failed to save university");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this university?")) return;

    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/universities/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchUnis();
      }
    } catch (error) {
      console.error("Failed to delete university:", error);
    }
  };

  const filteredUnis = unis.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
            Universities
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage partner universities and institutions.</p>
        </div>
        <Button 
          className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white"
          onClick={() => { setEditingUni({ is_featured: false }); setIsModalOpen(true); }}
        >
          <Plus size={16} className="mr-2" /> Add University
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between mb-6">
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search by name or country..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-lg h-9"
          />
        </div>
        <div className="text-sm text-gray-500">
          Total: <strong>{unis.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">University</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Ranking</th>
                <th className="px-6 py-4 font-semibold">Featured</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading universities...</td>
                </tr>
              ) : filteredUnis.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No universities found.</td>
                </tr>
              ) : (
                filteredUnis.map((uni) => (
                  <tr key={uni.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#1a2f5e]">{uni.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        {uni.country}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {uni.ranking ? (
                        <div className="flex items-center gap-1.5 text-amber-600 font-medium bg-amber-50 px-2.5 py-1 rounded-md w-fit">
                          <Trophy size={13} /> #{uni.ranking}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {uni.is_featured ? (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">Yes</span>
                      ) : (
                        <span className="text-gray-400 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          onClick={() => { setEditingUni(uni); setIsModalOpen(true); }}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(uni.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1a2f5e]">
              {editingUni?.id ? "Edit University" : "Add University"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>University Name *</Label>
              <Input 
                value={editingUni?.name || ""} 
                onChange={e => setEditingUni({...editingUni, name: e.target.value})}
                placeholder="e.g. University of Oxford"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Input 
                  value={editingUni?.country || ""} 
                  onChange={e => setEditingUni({...editingUni, country: e.target.value})}
                  placeholder="e.g. United Kingdom"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Ranking</Label>
                <Input 
                  type="number"
                  value={editingUni?.ranking || ""} 
                  onChange={e => setEditingUni({...editingUni, ranking: e.target.value ? parseInt(e.target.value) : null})}
                  placeholder="e.g. 3"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input 
                  value={editingUni?.website_url || ""} 
                  onChange={e => setEditingUni({...editingUni, website_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input 
                  value={editingUni?.logo_url || ""} 
                  onChange={e => setEditingUni({...editingUni, logo_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Short Description</Label>
              <Textarea 
                value={editingUni?.description || ""} 
                onChange={e => setEditingUni({...editingUni, description: e.target.value})}
                placeholder="A brief overview of the university..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input 
                type="checkbox" 
                id="is_featured"
                checked={editingUni?.is_featured || false}
                onChange={e => setEditingUni({...editingUni, is_featured: e.target.checked})}
                className="rounded border-gray-300 text-[#c9a84c] focus:ring-[#c9a84c]"
              />
              <Label htmlFor="is_featured" className="cursor-pointer">Mark as Featured University</Label>
            </div>

            <DialogFooter className="mt-8">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#1a2f5e] hover:bg-[#2a4a8e] text-white">Save University</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
