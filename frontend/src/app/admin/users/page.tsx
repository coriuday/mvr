"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Shield, Mail, Key, ChevronDown,
  RefreshCw, Loader2, Users, AlertCircle, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/services/api";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  formatRoleLabel,
  normalizeRole,
  toApiRole,
  type StaffRole,
} from "@/lib/admin-permissions";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLE_COLORS: Record<StaffRole, string> = {
  ADMIN:    "bg-[#1a2f5e] text-white",
  EDITOR:   "bg-purple-100 text-purple-700",
  COUNSELOR:"bg-amber-100 text-[#c9a84c]",
};

const ROLES: StaffRole[] = ["ADMIN", "EDITOR", "COUNSELOR"];

function userStaffRole(user: StaffUser): StaffRole {
  return normalizeRole(user.role) ?? "COUNSELOR";
}

// ── Active status toggle ──────────────────────────────────────────────────────
function ActiveToggle({ user, onChanged }: { user: StaffUser; onChanged: () => void }) {
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/users/${user.id}/active`, { is_active: !user.is_active });
      toast.success(user.is_active ? "User deactivated" : "User activated");
      onChanged();
    } catch {
      toast.error("Failed to update user status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-opacity ${
        user.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
      } ${saving ? "opacity-60" : "hover:opacity-80"}`}
    >
      {saving ? <Loader2 size={10} className="animate-spin" /> : null}
      <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
      {user.is_active ? "Active" : "Inactive"}
    </button>
  );
}

// ── Role change dropdown ──────────────────────────────────────────────────────
function RoleDropdown({ user, onChanged }: { user: StaffUser; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<StaffRole | null>(null);
  const currentRole = userStaffRole(user);

  const applyRole = async (role: StaffRole) => {
    if (role === currentRole) { setOpen(false); return; }
    setPending(role);
    setSaving(true);
    setOpen(false);
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: toApiRole(role) });
      toast.success(`${user.name}'s role updated to ${formatRoleLabel(role)}`);
      onChanged();
    } catch {
      toast.error("Failed to update role");
    } finally {
      setSaving(false);
      setPending(null);
    }
  };

  const displayRole = pending ?? currentRole;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={saving}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[displayRole]} ${saving ? "opacity-60" : "cursor-pointer hover:opacity-80"} transition-opacity`}
      >
        {saving ? <Loader2 size={10} className="animate-spin" /> : null}
        {formatRoleLabel(displayRole)}
        <ChevronDown size={11} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden w-36">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => applyRole(r)}
                className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors hover:bg-gray-50 ${r === currentRole ? "text-[#1a2f5e]" : "text-gray-600"}`}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${r === "ADMIN" ? "bg-[#1a2f5e]" : r === "EDITOR" ? "bg-purple-400" : "bg-[#c9a84c]"}`} />
                {formatRoleLabel(r)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Delete user ───────────────────────────────────────────────────────────────
function DeleteUserButton({
  user,
  currentUserId,
  onDeleted,
}: {
  user: StaffUser;
  currentUserId?: string;
  onDeleted: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isSelf = Boolean(currentUserId && user.id === currentUserId);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${user.id}`);
      toast.success(`${user.name} removed`);
      setConfirmOpen(false);
      onDeleted();
    } catch (err: unknown) {
      const ae = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(ae.response?.data?.error?.message || "Failed to remove user");
    } finally {
      setDeleting(false);
    }
  };

  if (isSelf) {
    return <span className="text-xs text-gray-400">You</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        title="Remove user permanently"
      >
        <Trash2 size={14} />
        Remove
      </button>
      <Dialog open={confirmOpen} onOpenChange={(o) => { if (!deleting) setConfirmOpen(o); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1a2f5e]">Remove staff member?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Permanently remove <strong>{user.name}</strong> ({user.email})? This cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <><Loader2 size={14} className="mr-2 animate-spin" />Removing…</> : "Remove permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Register form modal ───────────────────────────────────────────────────────
function RegisterModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "COUNSELOR" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await api.post("/auth/register", { name: form.name, email: form.email, password: form.password });
      toast.success(`Account created for ${form.name}. They start as Counselor — upgrade role below.`);
      setForm({ name: "", email: "", password: "", role: "COUNSELOR" });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const ae = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(ae.response?.data?.error?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!loading) { if (!o) onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1a2f5e] flex items-center gap-2">
            <UserPlus size={18} /> Add Staff Member
          </DialogTitle>
        </DialogHeader>

        <div className="mt-1 mb-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          New accounts always start as <strong>Counselor</strong>. Upgrade role after creation using the dropdown in the user table.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <div className="relative">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" required className="pl-9" />
              <UserPlus size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Email Address *</Label>
            <div className="relative">
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="guntur@mvrconsultants.org" required className="pl-9" />
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Password *</Label>
            <div className="relative">
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" required className="pl-9" />
              <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400">Provide a temporary strong password. Ask the user to change it after first login.</p>
          </div>

          <div className="space-y--2 pt-1">
            <Label className="mb-3 block">Initial Role (cosmetic — always Counselor)</Label>
            <div className="flex gap-3">
              {(["COUNSELOR", "ADMIN"] as const).map((r) => (
                <label key={r} className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${form.role === r ? (r === "ADMIN" ? "border-[#1a2f5e] bg-[#1a2f5e]/5" : "border-[#c9a84c] bg-amber-50") : "border-gray-100 hover:border-gray-200"}`}>
                  <input type="radio" name="role" value={r} className="sr-only" checked={form.role === r} onChange={() => setForm({ ...form, role: r })} />
                  <Shield size={20} className={form.role === r ? (r === "ADMIN" ? "text-[#1a2f5e]" : "text-[#c9a84c]") : "text-gray-300"} />
                  <span className={`mt-1.5 text-xs font-bold ${form.role === r ? (r === "ADMIN" ? "text-[#1a2f5e]" : "text-[#c9a84c]") : "text-gray-400"}`}>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" className="bg-[#1a2f5e] hover:bg-[#0f1c3d] text-white" disabled={loading}>
              {loading ? <><Loader2 size={14} className="mr-2 animate-spin" />Creating…</> : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function UserSkeleton() {
  return (
    <div className="divide-y divide-gray-50">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="w-9 h-9 bg-gray-100 rounded-full animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-40" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-56" />
          </div>
          <div className="h-6 bg-gray-100 rounded-full animate-pulse w-20" />
          <div className="h-6 bg-gray-100 rounded-full animate-pulse w-14" />
          <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const { user: currentUser } = useAdminAuth();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.data ?? []);
    } catch {
      toast.error("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f5e]">Staff Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage team members, roles, and access. Deactivate or remove users to revoke access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <Button className="bg-[#1a2f5e] hover:bg-[#0f1c3d] text-white" onClick={() => setRegisterOpen(true)}>
            <UserPlus size={16} className="mr-2" /> Add Staff Member
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {ROLES.map((role) => {
          const count = users.filter((u) => normalizeRole(u.role) === role).length;
          return (
            <div key={role} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === "ADMIN" ? "bg-[#1a2f5e]/10" : role === "EDITOR" ? "bg-purple-50" : "bg-amber-50"}`}>
                <Users size={18} className={role === "ADMIN" ? "text-[#1a2f5e]" : role === "EDITOR" ? "text-purple-500" : "text-[#c9a84c]"} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a2f5e]">{count}</p>
                <p className="text-gray-500 text-xs capitalize">{formatRoleLabel(role).toLowerCase()}s</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-[#1a2f5e] text-sm">Team Members ({users.length})</h2>
          <p className="text-xs text-gray-400">Click a role badge to change it</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/60 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-semibold">Member</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Joined</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}><UserSkeleton /></td></tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    No staff users found.{" "}
                    <button onClick={() => setRegisterOpen(true)} className="text-[#1a2f5e] underline font-medium">Add one</button>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1a2f5e] flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1a2f5e]">{user.name}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleDropdown user={user} onChanged={fetchUsers} />
                    </td>
                    <td className="px-6 py-4">
                      <ActiveToggle user={user} onChanged={fetchUsers} />
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <DeleteUserButton
                        user={user}
                        currentUserId={currentUser?.id}
                        onDeleted={fetchUsers}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} onSuccess={fetchUsers} />
    </div>
  );
}
