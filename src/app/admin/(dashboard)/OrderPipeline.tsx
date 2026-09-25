import Link from "next/link";

const STAGES = [
  { key: "pending",    label: "Pending",    color: "text-amber-400",  bar: "bg-amber-500",  pulse: true  },
  { key: "processing", label: "Processing", color: "text-yellow-400", bar: "bg-yellow-500", pulse: false },
  { key: "shipped",    label: "Shipped",    color: "text-blue-400",   bar: "bg-blue-500",   pulse: false },
] as const;

interface StageData { key: string; count: number; total: number }
interface Props { stages: StageData[] }

export function OrderPipeline({ stages }: Props) {
  const dataMap = Object.fromEntries(stages.map((s) => [s.key, s]));

  return (
    <div className="flex gap-2">
      {STAGES.map((stage) => {
        const count = dataMap[stage.key]?.count ?? 0;
        const hasOrders = count > 0;

        return (
          <Link
            key={stage.key}
            href={`/admin/orders?status=${stage.key}`}
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-3 hover:border-gray-700 hover:bg-gray-800/50 transition-all group"
          >
            <div className={`h-[2px] w-6 rounded-full mb-3 ${hasOrders ? stage.bar : "bg-gray-800"}`} />
            <p className={`text-2xl font-bold tabular-nums mb-1 ${hasOrders ? "text-white" : "text-gray-700"}`}>
              {count}
            </p>
            <p className={`text-[11px] font-medium ${hasOrders ? stage.color : "text-gray-600"} flex items-center gap-1.5`}>
              {stage.pulse && hasOrders && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block flex-shrink-0" />}
              {stage.label}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
