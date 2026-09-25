"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface DataPoint {
  label: string;
  revenue: number;
  orders: number;
}

interface Props {
  data: DataPoint[];
  groupByDay: boolean;
  periodLabel: string;
}

function formatXAxis(value: string, groupByDay: boolean) {
  if (!groupByDay) {
    // YYYY-MM → "Jan", "Feb" etc
    const m = parseInt(value.slice(5), 10);
    return MONTH_SHORT[m - 1] ?? value;
  }
  // YYYY-MM-DD → "15 Sep" style
  const d = new Date(value + "T00:00:00");
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, groupByDay }: any) {
  if (!active || !payload?.length) return null;
  const revenue = payload.find((p: { dataKey: string }) => p.dataKey === "revenue")?.value ?? 0;
  const orders  = payload.find((p: { dataKey: string }) => p.dataKey === "orders")?.value ?? 0;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{formatXAxis(String(label), groupByDay)}</p>
      <p className="text-amber-400">₹{Number(revenue).toLocaleString("en-IN")}</p>
      <p className="text-blue-400">{orders} orders</p>
    </div>
  );
}

export function AnalyticsCharts({ data, groupByDay, periodLabel }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded p-5">
      <h3 className="text-gray-300 text-sm font-medium mb-5">Revenue &amp; Orders — {periodLabel}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickFormatter={(v: string) => formatXAxis(v, groupByDay)}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="revenue"
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickFormatter={(v: number) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            tick={{ fill: "#6B7280", fontSize: 11 }}
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<CustomTooltip groupByDay={groupByDay} />} cursor={{ fill: "#1f2937" }} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#9CA3AF", paddingTop: 12 }}
            formatter={(value) => value === "revenue" ? "Revenue" : "Orders"}
          />
          <Bar
            yAxisId="revenue"
            dataKey="revenue"
            fill="#92400e"
            radius={[2, 2, 0, 0]}
            maxBarSize={32}
          />
          <Line
            yAxisId="orders"
            dataKey="orders"
            stroke="#60A5FA"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#60A5FA" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
