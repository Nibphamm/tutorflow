"use client";

import { useMemo, useState } from "react";

type StudentRow = { id: string; name: string };
type DayInfo = { day: number; weekday: string; isWeekday: boolean };

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function BulkGrid({
  students,
  year,
  month,
  initialChecked,
  classId,
  subjectIndex,
  action,
}: {
  students: StudentRow[];
  year: number;
  month: number;
  initialChecked: Record<string, boolean>; // key = `${studentId}-${day}`
  classId: string;
  subjectIndex: number;
  action: (formData: FormData) => Promise<void>;
}) {
  const days: DayInfo[] = useMemo(() => {
    const last = new Date(year, month, 0).getDate();
    return Array.from({ length: last }, (_, i) => {
      const day = i + 1;
      const dow = new Date(year, month - 1, day).getDay();
      return { day, weekday: WEEKDAY_LABELS[dow], isWeekday: dow >= 1 && dow <= 5 };
    });
  }, [year, month]);

  const [checked, setChecked] = useState<Record<string, boolean>>(initialChecked);

  function key(studentId: string, day: number) {
    return `${studentId}-${day}`;
  }

  function toggle(studentId: string, day: number) {
    const k = key(studentId, day);
    setChecked((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  function bulkSet(value: boolean, onlyWeekday: boolean) {
    setChecked((prev) => {
      const next = { ...prev };
      for (const s of students) {
        for (const d of days) {
          if (onlyWeekday && !d.isWeekday) continue;
          next[key(s.id, d.day)] = value;
        }
      }
      return next;
    });
  }

  const selectedCount = Object.values(checked).filter(Boolean).length;

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="subjectIndex" value={subjectIndex} />
      <input type="hidden" name="year" value={year} />
      <input type="hidden" name="month" value={month} />
      {students.map((s) => (
        <input key={s.id} type="hidden" name="studentId" value={s.id} />
      ))}
      {students.flatMap((s) =>
        days.map((d) =>
          checked[key(s.id, d.day)] ? (
            <input
              key={key(s.id, d.day)}
              type="hidden"
              name={`cell-${s.id}-${d.day}`}
              value="1"
            />
          ) : null
        )
      )}

      <div className="flex items-center gap-2 text-sm">
        <button type="button" onClick={() => bulkSet(true, false)} className="rounded-md border border-slate-300 px-2 py-1">
          ✅ Chọn hết
        </button>
        <button type="button" onClick={() => bulkSet(false, false)} className="rounded-md border border-slate-300 px-2 py-1">
          🗑️ Bỏ hết
        </button>
        <button type="button" onClick={() => bulkSet(true, true)} className="rounded-md border border-slate-300 px-2 py-1">
          Chọn 📅 T2→T6
        </button>
        <span className="text-slate-500">Đã chọn: {selectedCount} buổi</span>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-100 px-3 py-2 text-left">Học sinh</th>
              {days.map((d) => (
                <th key={d.day} className="w-8 px-1 py-2 text-center">
                  <div>{d.day}</div>
                  <div className="text-slate-400">{d.weekday}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="sticky left-0 z-10 bg-white px-3 py-1 font-medium whitespace-nowrap">
                  {s.name}
                </td>
                {days.map((d) => (
                  <td key={d.day} className="text-center">
                    <input
                      type="checkbox"
                      checked={!!checked[key(s.id, d.day)]}
                      onChange={() => toggle(s.id, d.day)}
                    />
                  </td>
                ))}
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={days.length + 1} className="px-4 py-6 text-center text-slate-400">
                  Lớp chưa có học sinh
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {students.length > 0 && (
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          💾 Lưu ({selectedCount} buổi)
        </button>
      )}
    </form>
  );
}
