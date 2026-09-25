"use client";

import { useState } from "react";

type Period = "current" | "1m" | "3m";

interface Props {
  data: Record<Period, { revenue: number; orders: number }>;
}

export function RevenueOrdersWidget({ data }: Props) {
  const [period, setPeriod] = useState<Period>("current");
  const { revenue, orders } = data[period];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-xs uppercase tracking-wider">Revenue &amp; Orders</p>
        <div className="flex text-xs border border-gray-700 rounded overflow-hidden">
          <button
            onClick={() => setPeriod("current")}
            className={`px-3 py-1 transition-colors ${period === "current" ? "bg-amber-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            This Month
          </button>
          <button
            onClick={() => setPeriod("1m")}
            className={`px-3 py-1 transition-colors ${period === "1m" ? "bg-amber-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            Last Month
          </button>
          <button
            onClick={() => setPeriod("3m")}
            className={`px-3 py-1 transition-colors ${period === "3m" ? "bg-amber-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            Last 3 Months
          </button>
        </div>
      </div>
      <div className="flex items-baseline gap-8">
        <div className="flex items-baseline gap-3">
          <p className="text-gray-500 text-xs">Revenue</p>
          <p className="text-white text-2xl font-semibold">₹{revenue.toLocaleString("en-IN")}</p>
        </div>
        <div className="w-px h-6 bg-gray-700" />
        <div className="flex items-baseline gap-3">
          <p className="text-gray-500 text-xs">Orders</p>
          <p className="text-white text-2xl font-semibold">{orders}</p>
        </div>
      </div>
    </div>
  );
}
