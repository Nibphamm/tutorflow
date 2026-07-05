import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { resolvePeriod, monthRange, daysInMonth } from "@/lib/period";
import { computeTuition, formatVnd } from "@/lib/fees";
import { deleteStudentAction } from "./actions";
import { Button, Card, EmptyState, Input, PageHeader, Select } from "@/components/ui";
import { PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/icons";

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

  const rows = students.map((s) => {
    const att = byStudent.get(s.id) ?? [];
    const takenDates = new Set(att.map((a) => a.date.toISOString().slice(0, 10)));
    const tuition = computeTuition(s, att);
    const sessions = tuition.subjects.reduce((sum, x) => sum + x.sessions, 0);
    return { student: s, taken: takenDates.size, sessions, total: tuition.total };
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Học sinh"
        action={
          <Link href="/dashboard/students/new">
            <Button variant="primary">
              <PlusIcon /> Thêm học sinh
            </Button>
          </Link>
        }
      />

      <Card>
        <form className="flex flex-wrap gap-2" method="get">
          <input type="hidden" name="month" value={period.month} />
          <input type="hidden" name="year" value={period.year} />
          <div className="relative min-w-[160px] flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input name="q" defaultValue={sp.q} placeholder="Tìm theo tên..." className="pl-9" />
          </div>
          <Select name="classId" defaultValue={sp.classId || ""} className="w-auto min-w-[140px]">
            <option value="">Tất cả lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Button type="submit">Lọc</Button>
        </form>
      </Card>

      {rows.length === 0 ? (
        <EmptyState>Chưa có học sinh nào. Bấm “Thêm học sinh” để bắt đầu.</EmptyState>
      ) : (
        <>
          {/* Mobile: danh sách thẻ */}
          <div className="grid gap-3 sm:hidden">
            {rows.map(({ student: s, taken, sessions, total }) => (
              <Card key={s.id}>
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/dashboard/students/${s.id}/invoice?month=${period.month}&year=${period.year}`}
                    className="font-semibold text-slate-900 hover:text-indigo-600"
                  >
                    {s.name}
                  </Link>
                  <div className="flex gap-1">
                    <Link
                      href={`/dashboard/students/${s.id}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                      aria-label="Sửa"
                    >
                      <PencilIcon />
                    </Link>
                    <form action={deleteStudentAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                        aria-label="Xoá"
                      >
                        <TrashIcon />
                      </button>
                    </form>
                  </div>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">Lớp {s.class.name}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Điểm danh {taken}/{totalDays} · {sessions} buổi
                  </span>
                  <span className="font-semibold text-slate-900">{formatVnd(total)}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop: bảng */}
          <Card padded={false} className="hidden overflow-hidden sm:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Học sinh</th>
                  <th className="px-4 py-3 font-medium">Lớp</th>
                  <th className="px-4 py-3 font-medium">Điểm danh</th>
                  <th className="px-4 py-3 font-medium">Số buổi đã học</th>
                  <th className="px-4 py-3 font-medium">Học phí tháng</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(({ student: s, taken, sessions, total }) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/students/${s.id}/invoice?month=${period.month}&year=${period.year}`}
                        className="font-medium text-slate-900 hover:text-indigo-600 hover:underline"
                      >
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.class.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {taken}/{totalDays}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{sessions}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatVnd(total)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/students/${s.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                          aria-label="Sửa"
                        >
                          <PencilIcon />
                        </Link>
                        <form action={deleteStudentAction}>
                          <input type="hidden" name="id" value={s.id} />
                          <button
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                            aria-label="Xoá"
                          >
                            <TrashIcon />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
