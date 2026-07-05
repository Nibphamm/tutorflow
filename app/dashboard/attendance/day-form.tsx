"use client";

import { Button, Card, EmptyState } from "@/components/ui";
import { SendIcon } from "@/components/icons";

type StudentRow = { id: string; name: string; present: boolean | null };

export function DayForm({
  date,
  subjectIndex,
  students,
  action,
}: {
  date: string;
  subjectIndex: number;
  students: StudentRow[];
  action: (formData: FormData) => Promise<void>;
}) {
  if (students.length === 0) {
    return <EmptyState>Lớp chưa có học sinh.</EmptyState>;
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="subjectIndex" value={subjectIndex} />

      <Card padded={false} className="divide-y divide-slate-100">
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <input type="hidden" name="studentId" value={s.id} />
            <span className="font-medium text-slate-900">{s.name}</span>
            <div className="flex gap-2">
              <label
                className={
                  "flex min-h-9 cursor-pointer items-center rounded-lg border px-3 text-sm font-medium transition-colors " +
                  "has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50 has-[:checked]:text-emerald-700 " +
                  "border-slate-200 text-slate-500"
                }
              >
                <input
                  type="radio"
                  name={`present-${s.id}`}
                  value="yes"
                  defaultChecked={s.present === true}
                  className="sr-only"
                />
                Có
              </label>
              <label
                className={
                  "flex min-h-9 cursor-pointer items-center rounded-lg border px-3 text-sm font-medium transition-colors " +
                  "has-[:checked]:border-red-300 has-[:checked]:bg-red-50 has-[:checked]:text-red-700 " +
                  "border-slate-200 text-slate-500"
                }
              >
                <input
                  type="radio"
                  name={`present-${s.id}`}
                  value="no"
                  defaultChecked={s.present !== true}
                  className="sr-only"
                />
                Vắng
              </label>
            </div>
          </div>
        ))}
      </Card>

      <Button type="submit" variant="primary">
        <SendIcon /> Gửi điểm danh ({students.length} học sinh)
      </Button>
    </form>
  );
}
