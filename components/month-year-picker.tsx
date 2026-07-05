"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { resolvePeriod } from "@/lib/period";
import { CalendarIcon } from "@/components/icons";

const COMPACT_SELECT =
  "min-h-9 rounded-lg border border-slate-300 bg-white py-1.5 pl-2 pr-1 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export function MonthYearPicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = resolvePeriod({
    month: searchParams.get("month") ?? undefined,
    year: searchParams.get("year") ?? undefined,
  });

  function update(next: Partial<{ month: number; year: number }>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", String(next.month ?? period.month));
    params.set("year", String(next.year ?? period.year));
    router.push(`${pathname}?${params.toString()}`);
  }

  const years = Array.from({ length: 5 }, (_, i) => period.year - 2 + i);

  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <CalendarIcon className="hidden h-4 w-4 shrink-0 sm:block" />
      <select
        value={period.month}
        onChange={(e) => update({ month: Number(e.target.value) })}
        className={COMPACT_SELECT}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>
            Tháng {m}
          </option>
        ))}
      </select>
      <select
        value={period.year}
        onChange={(e) => update({ year: Number(e.target.value) })}
        className={COMPACT_SELECT}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
