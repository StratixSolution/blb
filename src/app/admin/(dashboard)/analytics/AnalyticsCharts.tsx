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

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface DataPoint {
  label: string;
  revenue: number;
  orders: number;
}

interface Props {
  data: DataPoint[];
  isMonthly: boolean;
  periodLabel: string;
}

function formatINR(v: number) {
  return `₹${v.toLocaleString("en-IN")}`;
}

function formatXAxis(value: string, isMonthly: boolean) {
  if (isMonthly) {
    const m = parseInt(value.slice(5), 10);
    return MONTH_SHORT[m - 1] ?? value;
  }
  return value.slice(5); // MM-DD
}

export function AnalyticsCharts({ data, isMonthly, periodLabel }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-gray-900 border border-gray-800 rounded p-5">
        <h3 className="text-gray-300 text-sm font-medium mb-5">Revenue — {periodLabel}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              tickFormatter={(v: string) => formatXAxis(v, isMonthly)}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              tickFormatter={(v: number) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
              width={48}
            />
            <Tooltip
              contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 4 }}
              labelStyle={{ color: "#D1D5DB" }}
              labelFormatter={(v) => formatXAxis(String(v), isMonthly)}
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
        <h3 className="text-gray-300 text-sm font-medium mb-5">Orders — {periodLabel}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              tickFormatter={(v: string) => formatXAxis(v, isMonthly)}
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
              labelFormatter={(v) => formatXAxis(String(v), isMonthly)}
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
