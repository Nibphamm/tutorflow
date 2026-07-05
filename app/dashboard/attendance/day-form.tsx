"use client";

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
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="subjectIndex" value={subjectIndex} />

      <table className="w-full overflow-hidden rounded-lg bg-white text-sm shadow">
        <thead className="bg-slate-100 text-left text-slate-600">
          <tr>
            <th className="px-4 py-2">Học sinh</th>
            <th className="px-4 py-2">Có</th>
            <th className="px-4 py-2">Vắng</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-t border-slate-100">
              <td className="px-4 py-2">
                <input type="hidden" name="studentId" value={s.id} />
                {s.name}
              </td>
              <td className="px-4 py-2">
                <input
                  type="radio"
                  name={`present-${s.id}`}
                  value="yes"
                  defaultChecked={s.present === true}
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="radio"
                  name={`present-${s.id}`}
                  value="no"
                  defaultChecked={s.present !== true}
                />
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                Lớp chưa có học sinh
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {students.length > 0 && (
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          🚀 Gửi điểm danh ({students.length} học sinh)
        </button>
      )}
    </form>
  );
}
