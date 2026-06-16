"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import Link from "next/link";
import api from "@/services/api";
import { Users, TrendingUp, Award, RefreshCw, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface Stats {
  total_leads: number;
  new_leads_today: number;
  new_leads_total: number;
  converted_leads: number;
  conversion_rate: string;
  staff_count: number;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country_interest?: string;
  status: string;
  source: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  NEW:         "bg-blue-100 text-blue-700",
  CONTACTED:   "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  CONVERTED:   "bg-emerald-100 text-emerald-700",
  REJECTED:    "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, leadsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/recent-leads"),
      ]);
      setStats(statsRes.data.data);
      setRecentLeads(leadsRes.data.data ?? []);
    } catch (e: unknown) {
      const axiosErr = e as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message ?? "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const STAT_CARDS = stats ? [
    { icon: Users,       label: "Total Leads",       value: stats.total_leads,      color: "bg-blue-50 text-blue-600",    border: "border-blue-200" },
    { icon: AlertCircle, label: "New Today",          value: stats.new_leads_today,  color: "bg-amber-50 text-amber-600",  border: "border-amber-200" },
    { icon: TrendingUp,  label: "Conversion Rate",   value: stats.conversion_rate,  color: "bg-emerald-50 text-emerald-600", border: "border-emerald-200" },
    { icon: Award,       label: "Staff Members",      value: stats.staff_count,      color: "bg-purple-50 text-purple-600",border: "border-purple-200" },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <div>
          <p className="font-semibold text-gray-700">Failed to load dashboard</p>
          <p className="text-gray-400 text-sm mt-1">{error}</p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 bg-[#1a2f5e] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2a4a8e] transition-colors">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {STAT_CARDS.map(({ icon: Icon, label, value, color, border }) => (
          <div key={label} className={`bg-white rounded-2xl border ${border} p-6`}>
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-[#1a2f5e]">{value}</p>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-[#1a2f5e]">Recent Leads</h2>
            <p className="text-gray-400 text-xs mt-0.5">Last 10 inquiries received</p>
          </div>
          <Link href="/admin/leads"
            className="text-[#c9a84c] text-sm font-semibold hover:underline">
            View all →
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 size={36} className="text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No leads yet</p>
            <p className="text-gray-300 text-xs mt-1">Leads from your contact form will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 text-left font-semibold">Name</th>
                  <th className="px-6 py-3 text-left font-semibold">Email</th>
                  <th className="px-6 py-3 text-left font-semibold">Country</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1a2f5e]">{lead.name}</td>
                    <td className="px-6 py-4 text-gray-500">{lead.email}</td>
                    <td className="px-6 py-4 text-gray-500">{lead.country_interest ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {lead.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-5">
        {[
          { href: "/admin/leads",   label: "Manage Leads",        desc: "View, update and respond to inquiries", icon: Users,       color: "bg-blue-600"    },
          { href: "/admin/blogs",   label: "Write a Blog Post",   desc: "Publish student success stories",       icon: CheckCircle2,color: "bg-emerald-600" },
          { href: "/admin/unis",    label: "Add a University",    desc: "Expand your partner network",           icon: Award,       color: "bg-purple-600"  },
        ].map(({ href, label, desc, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon size={18} className="text-white" />
            </div>
            <h3 className="font-bold text-[#1a2f5e] mb-1">{label}</h3>
            <p className="text-gray-400 text-sm">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
