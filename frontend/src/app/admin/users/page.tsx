"use client";

import { useState } from "react";
import { UserPlus, Shield, Mail, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminUsersPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "COUNSELOR",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        credentials: "include", // httpOnly cookie auth
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Successfully created account for ${formData.name}`);
        setFormData({ name: "", email: "", password: "", role: "COUNSELOR" });
      } else {
        setErrorMsg(data.error?.message || data.message || "Failed to create user");
      }
    } catch (err) {
      setErrorMsg("An error occurred while communicating with the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
          Staff Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">Register new administrators and counselors.</p>
      </div>

      <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-[#1a2f5e]/5 rounded-lg flex items-center justify-center text-[#1a2f5e]">
            <UserPlus size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1a2f5e]">Add New Staff Member</h2>
            <p className="text-sm text-gray-500">Only ADMIN users can perform this action.</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-sm font-medium">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <div className="relative">
              <Input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
                required
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <UserPlus size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Address *</Label>
            <div className="relative">
              <Input 
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="john.doe@mvrconsultants.com"
                required
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Password *</Label>
            <div className="relative">
              <Input 
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="Must be at least 8 characters with numbers and symbols"
                required
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Key size={16} />
              </div>
            </div>
            <p className="text-xs text-gray-400">Please provide a strong, temporary password for the new user.</p>
          </div>

          <div className="space-y-2 pb-4">
            <Label>System Role *</Label>
            <div className="flex gap-4 mt-2">
              <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.role === "COUNSELOR" ? "border-[#c9a84c] bg-[#c9a84c]/5" : "border-gray-100 hover:border-gray-200"
              }`}>
                <input type="radio" name="role" value="COUNSELOR" className="sr-only" 
                  checked={formData.role === "COUNSELOR"} onChange={() => setFormData({...formData, role: "COUNSELOR"})} 
                />
                <Shield size={24} className={formData.role === "COUNSELOR" ? "text-[#c9a84c]" : "text-gray-400"} />
                <span className={`mt-2 font-bold ${formData.role === "COUNSELOR" ? "text-[#c9a84c]" : "text-gray-500"}`}>Counselor</span>
                <span className="text-xs text-gray-400 text-center mt-1">Can view leads and contact forms</span>
              </label>

              <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.role === "ADMIN" ? "border-[#1a2f5e] bg-[#1a2f5e]/5" : "border-gray-100 hover:border-gray-200"
              }`}>
                <input type="radio" name="role" value="ADMIN" className="sr-only" 
                  checked={formData.role === "ADMIN"} onChange={() => setFormData({...formData, role: "ADMIN"})} 
                />
                <Shield size={24} className={formData.role === "ADMIN" ? "text-[#1a2f5e]" : "text-gray-400"} />
                <span className={`mt-2 font-bold ${formData.role === "ADMIN" ? "text-[#1a2f5e]" : "text-gray-500"}`}>Administrator</span>
                <span className="text-xs text-gray-400 text-center mt-1">Full system access (CRUD)</span>
              </label>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-[#1a2f5e] hover:bg-[#2a4a8e] text-white h-12">
            {loading ? "Creating Account..." : "Create Staff Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
