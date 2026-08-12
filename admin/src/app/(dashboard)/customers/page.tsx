"use client";

import React, { useState } from "react";
import { Users, Search, Mail, Phone, ShieldCheck, DollarSign, Calendar } from "lucide-react";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  kycStatus: "VERIFIED" | "PENDING" | "REJECTED";
  bookingsCount: number;
  totalSpend: number;
  status: "ACTIVE" | "SUSPENDED";
}

const MOCK_CUSTOMERS: CustomerRecord[] = [
  {
    id: "CUST-001",
    name: "Rahul Verma",
    email: "rahul.v@gmail.com",
    phone: "+91 98765 43210",
    joined: "15 Jan 2026",
    kycStatus: "VERIFIED",
    bookingsCount: 8,
    totalSpend: 112450,
    status: "ACTIVE",
  },
  {
    id: "CUST-002",
    name: "Ananya Sharma",
    email: "ananya.sharma@yahoo.com",
    phone: "+91 98123 45678",
    joined: "02 Feb 2026",
    kycStatus: "PENDING",
    bookingsCount: 3,
    totalSpend: 42000,
    status: "ACTIVE",
  },
  {
    id: "CUST-003",
    name: "Vikramaditya Rao",
    email: "vikram.rao@cinemafilms.in",
    phone: "+91 99001 12233",
    joined: "10 Mar 2026",
    kycStatus: "VERIFIED",
    bookingsCount: 14,
    totalSpend: 289000,
    status: "ACTIVE",
  },
];

export default function AdminCustomersPage() {
  const [customers] = useState<CustomerRecord[]>(MOCK_CUSTOMERS);
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-light text-[#f5f1e8] font-serif">Customer Directory &amp; History</h1>
        <p className="text-xs text-[#9a9995] font-light mt-1">
          Manage registered filmmakers, verified accounts, and rental spend history.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9995]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer name, email, phone..."
          className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-[#f5f1e8] placeholder-[#9a9995]/50 focus:outline-none focus:border-[#d8b36a]"
        />
      </div>

      <div className="admin-card rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#0c0c0c] border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
              <th className="p-4">Customer ID</th>
              <th className="p-4">Name &amp; Contact</th>
              <th className="p-4">KYC Status</th>
              <th className="p-4">Rentals Count</th>
              <th className="p-4">Lifetime Spend</th>
              <th className="p-4">Account Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[#f5f1e8]">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-white/5 transition">
                <td className="p-4 font-mono text-[#d8b36a]">{c.id}</td>
                <td className="p-4">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-[10px] text-[#9a9995] font-mono">{c.email} • {c.phone}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${c.kycStatus === "VERIFIED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}>
                    {c.kycStatus}
                  </span>
                </td>
                <td className="p-4 font-mono">{c.bookingsCount} Rentals</td>
                <td className="p-4 font-mono font-semibold text-[#f5f1e8]">₹{c.totalSpend.toLocaleString("en-IN")}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
