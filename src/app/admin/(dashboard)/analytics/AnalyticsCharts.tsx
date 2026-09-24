"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DailyPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface Props {
  data: DailyPoint[];
}

function formatINR(v: number) {
  return `₹${v.toLocaleString("en-IN")}`;
}

export function AnalyticsCharts({ data }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-gray-900 border border-gray-800 rounded p-5">
        <h3 className="text-gray-300 text-sm font-medium mb-5">Net Revenue (last 30 days)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              tickFormatter={(v: string) => v.slice(5)}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
              width={48}
            />
            <Tooltip
              contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 4 }}
              labelStyle={{ color: "#D1D5DB" }}
              formatter={(v) => [formatINR(Number(v)), "Revenue"]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#C9953C"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#C9953C" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded p-5">
        <h3 className="text-gray-300 text-sm font-medium mb-5">Orders (last 30 days)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              tickFormatter={(v: string) => v.slice(5)}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              allowDecimals={false}
              width={32}
            />
            <Tooltip
              contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 4 }}
              labelStyle={{ color: "#D1D5DB" }}
              formatter={(v) => [Number(v), "Orders"]}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#60A5FA"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#60A5FA" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
