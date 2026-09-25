import Link from "next/link";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  pathname: string;
  /** All current searchParams including "q", excluding "page" */
  baseParams: string;
}

export function Pagination({ page, totalPages, total, pageSize, pathname, baseParams }: Props) {
  if (totalPages <= 1) return null;

  function url(p: number) {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  }

  const pages: number[] = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pages.push(i);
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
      <span className="text-gray-500 text-xs">
        {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()}
      </span>
      <div className="flex items-center gap-1">
        {page > 1 && (
          <Link href={url(page - 1)} className="text-gray-400 hover:text-white text-xs px-3 py-1.5 bg-gray-800 rounded border border-gray-700 transition-colors">
            ← Prev
          </Link>
        )}
        {pages[0] > 1 && <span className="text-gray-600 text-xs px-2">…</span>}
        {pages.map((p) => (
          <Link
            key={p}
            href={url(p)}
            className={`text-xs w-8 h-7 flex items-center justify-center rounded border transition-colors ${
              p === page
                ? "bg-amber-600 border-amber-600 text-black font-semibold"
                : "text-gray-400 hover:text-white bg-gray-800 border-gray-700"
            }`}
          >
            {p}
          </Link>
        ))}
        {pages[pages.length - 1] < totalPages && <span className="text-gray-600 text-xs px-2">…</span>}
        {page < totalPages && (
          <Link href={url(page + 1)} className="text-gray-400 hover:text-white text-xs px-3 py-1.5 bg-gray-800 rounded border border-gray-700 transition-colors">
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
