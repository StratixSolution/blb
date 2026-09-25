"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

interface Props {
  placeholder?: string;
  defaultValue?: string;
  pathname: string;
  /** All current searchParams except "q" and "page", already serialized */
  baseParams: string;
}

export function SearchInput({ placeholder = "Search...", defaultValue, pathname, baseParams }: Props) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleChange(val: string) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams(baseParams);
      if (val.trim()) params.set("q", val.trim());
      else params.delete("q");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    }, 300);
  }

  return (
    <div className="relative">
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        type="search"
        defaultValue={defaultValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="bg-gray-800 border border-gray-700 text-gray-200 text-sm pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-amber-500 placeholder:text-gray-600 w-64"
      />
    </div>
  );
}
