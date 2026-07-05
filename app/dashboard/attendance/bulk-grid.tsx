"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { CalendarIcon, CheckSquareIcon, SaveIcon, XSquareIcon } from "@/components/icons";

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

  if (students.length === 0) {
    return <EmptyState>Lớp chưa có học sinh.</EmptyState>;
  }

  return (
    <form action={action} className="space-y-4">
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

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={() => bulkSet(true, false)}>
          <CheckSquareIcon /> Chọn hết
        </Button>
        <Button type="button" variant="secondary" onClick={() => bulkSet(false, false)}>
          <XSquareIcon /> Bỏ hết
        </Button>
        <Button type="button" variant="secondary" onClick={() => bulkSet(true, true)}>
          <CalendarIcon /> Chọn T2→T6
        </Button>
        <Badge tone="neutral">Đã chọn: {selectedCount} buổi</Badge>
      </div>

      <Card padded={false} className="overflow-x-auto">
        <table className="text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="sticky left-0 z-10 min-w-[140px] bg-slate-50 px-3 py-2 text-left font-medium text-slate-500">
                Học sinh
              </th>
              {days.map((d) => (
                <th
                  key={d.day}
                  className={
                    "min-w-9 px-1 py-2 text-center text-xs font-medium " +
                    (d.isWeekday ? "text-slate-500" : "text-slate-400")
                  }
                >
                  <div>{d.day}</div>
                  <div className="text-[10px]">{d.weekday}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s) => (
              <tr key={s.id}>
                <td className="sticky left-0 z-10 min-w-[140px] bg-white px-3 py-2 font-medium text-slate-900">
                  {s.name}
                </td>
                {days.map((d) => (
                  <td key={d.day} className="px-1 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={!!checked[key(s.id, d.day)]}
                      onChange={() => toggle(s.id, d.day)}
                      className="h-4 w-4 cursor-pointer accent-indigo-600"
                      aria-label={`${s.name} ngày ${d.day}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Button type="submit" variant="primary">
        <SaveIcon /> Lưu ({selectedCount} buổi)
      </Button>
    </form>
  );
}
