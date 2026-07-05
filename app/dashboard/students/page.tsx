import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { resolvePeriod, monthRange, daysInMonth } from "@/lib/period";
import { computeTuition, formatVnd } from "@/lib/fees";
import { deleteStudentAction } from "./actions";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string; q?: string; classId?: string }>;
}) {
  const sp = await searchParams;
  const centerId = await requireCenterId();
  const period = resolvePeriod(sp);
  const { start, end } = monthRange(period);
  const totalDays = daysInMonth(period);

  const [students, classes] = await Promise.all([
    prisma.student.findMany({
      where: {
        centerId,
        classId: sp.classId || undefined,
        name: sp.q ? { contains: sp.q, mode: "insensitive" } : undefined,
      },
      include: { class: true },
      orderBy: { name: "asc" },
    }),
    prisma.class.findMany({ where: { centerId }, orderBy: { name: "asc" } }),
  ]);

  const studentIds = students.map((s) => s.id);
  const attendances = studentIds.length
    ? await prisma.attendance.findMany({
        where: { studentId: { in: studentIds }, date: { gte: start, lte: end } },
      })
    : [];

  const byStudent = new Map<string, typeof attendances>();
  for (const a of attendances) {
    const list = byStudent.get(a.studentId) ?? [];
    list.push(a);
    byStudent.set(a.studentId, list);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Học sinh</h1>
        <Link
          href="/dashboard/students/new"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          + Thêm học sinh
        </Link>
      </div>

      <form className="flex gap-2" method="get">
        <input type="hidden" name="month" value={period.month} />
        <input type="hidden" name="year" value={period.year} />
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Tìm theo tên..."
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          name="classId"
          defaultValue={sp.classId || ""}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Tất cả lớp</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="rounded-md border border-slate-300 px-3 py-2 text-sm">Lọc</button>
      </form>

      <table className="w-full overflow-hidden rounded-lg bg-white text-sm shadow">
        <thead className="bg-slate-100 text-left text-slate-600">
          <tr>
            <th className="px-4 py-2">Học sinh</th>
            <th className="px-4 py-2">Lớp</th>
            <th className="px-4 py-2">Điểm danh</th>
            <th className="px-4 py-2">Số buổi đã học</th>
            <th className="px-4 py-2">Học phí tháng</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const att = byStudent.get(s.id) ?? [];
            const takenDates = new Set(att.map((a) => a.date.toISOString().slice(0, 10)));
            const tuition = computeTuition(s, att);
            const sessions = tuition.subjects.reduce((sum, x) => sum + x.sessions, 0);
            return (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  <Link
                    href={`/dashboard/students/${s.id}/invoice?month=${period.month}&year=${period.year}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {s.name}
                  </Link>
                </td>
                <td className="px-4 py-2">{s.class.name}</td>
                <td className="px-4 py-2">
                  {takenDates.size}/{totalDays}
                </td>
                <td className="px-4 py-2">{sessions}</td>
                <td className="px-4 py-2">{formatVnd(tuition.total)}</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <Link
                    href={`/dashboard/students/${s.id}/edit`}
                    className="mr-3 text-slate-600 hover:underline"
                  >
                    Sửa
                  </Link>
                  <form action={deleteStudentAction} className="inline">
                    <input type="hidden" name="id" value={s.id} />
                    <button className="text-red-600 hover:underline">Xoá</button>
                  </form>
                </td>
              </tr>
            );
          })}
          {students.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                Chưa có học sinh nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
