"use client";

import React, { useState } from "react";
import { CreditCard, Search, DollarSign, ArrowUpRight, CheckCircle, RefreshCw } from "lucide-react";

interface PaymentTx {
  id: string;
  bookingId: string;
  customerName: string;
  amount: number;
  razorpayId: string;
  method: string;
  status: "PAID" | "FAILED" | "REFUNDED";
  date: string;
}

const MOCK_PAYMENTS: PaymentTx[] = [
  { id: "PAY-901", bookingId: "AUR-1042", customerName: "Rahul Verma", amount: 14997, razorpayId: "pay_Pk8841299A", method: "Razorpay UPI", status: "PAID", date: "12 Aug 2026, 09:15" },
  { id: "PAY-900", bookingId: "AUR-1041", customerName: "Ananya Sharma", amount: 16500, razorpayId: "pay_Pk8840112B", method: "Credit Card", status: "PAID", date: "11 Aug 2026, 18:40" },
  { id: "PAY-899", bookingId: "AUR-1040", customerName: "Vikramaditya Rao", amount: 26000, razorpayId: "pay_Pk8839001C", method: "Netbanking", status: "PAID", date: "10 Aug 2026, 10:10" },
];

export default function AdminPaymentsPage() {
  const [payments] = useState<PaymentTx[]>(MOCK_PAYMENTS);

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-light text-[#f5f1e8] font-serif">Payment Gateway Transactions</h1>
        <p className="text-xs text-[#9a9995] font-light mt-1">
          Razorpay integration logs, payment gateway callbacks, and transaction audit records.
        </p>
      </div>

      <div className="admin-card rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#0c0c0c] border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
              <th className="p-4">Payment ID</th>
              <th className="p-4">Booking ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Razorpay Ref</th>
              <th className="p-4">Method</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[#f5f1e8]">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition font-mono">
                <td className="p-4 text-[#d8b36a]">{p.id}</td>
                <td className="p-4 text-[#f5f1e8]">{p.bookingId}</td>
                <td className="p-4 font-sans">{p.customerName}</td>
                <td className="p-4 text-[#9a9995]">{p.razorpayId}</td>
                <td className="p-4 text-[#9a9995] font-sans">{p.method}</td>
                <td className="p-4 font-semibold text-[#f5f1e8]">₹{p.amount.toLocaleString("en-IN")}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {p.status}
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
