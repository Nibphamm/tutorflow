import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { resolvePeriod, monthRange } from "@/lib/period";
import { BulkGrid } from "../bulk-grid";
import { saveBulkAttendanceAction } from "../actions";

export default async function BulkAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; subjectIndex?: string; month?: string; year?: string }>;
}) {
  const sp = await searchParams;
  const centerId = await requireCenterId();
  const classes = await prisma.class.findMany({ where: { centerId }, orderBy: { name: "asc" } });
  const classId = sp.classId || classes[0]?.id || "";
  const subjectIndex = Number(sp.subjectIndex || 0);
  const period = resolvePeriod(sp);

  let students: { id: string; name: string }[] = [];
  const initialChecked: Record<string, boolean> = {};

  if (classId) {
    students = await prisma.student.findMany({
      where: { classId, centerId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    const { start, end } = monthRange(period);
    const attendances = await prisma.attendance.findMany({
      where: {
        studentId: { in: students.map((s) => s.id) },
        subjectIndex,
        present: true,
        date: { gte: start, lte: end },
      },
    });
    for (const a of attendances) {
      const day = a.date.getUTCDate();
      initialChecked[`${a.studentId}-${day}`] = true;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">📋 Điểm danh hàng loạt</h1>
        <Link href="/dashboard/attendance" className="text-sm text-slate-600 underline hover:text-slate-900">
          ← Điểm danh theo ngày
        </Link>
      </div>

      <form className="flex gap-2" method="get">
        <input type="hidden" name="month" value={period.month} />
        <input type="hidden" name="year" value={period.year} />
        <select name="classId" defaultValue={classId} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="subjectIndex" defaultValue={subjectIndex} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value={0}>Buổi 1</option>
          <option value={1}>Buổi 2</option>
        </select>
        <button className="rounded-md border border-slate-300 px-3 py-2 text-sm">Xem</button>
      </form>

      {classes.length === 0 ? (
        <p className="text-slate-500">Chưa có lớp nào, tạo lớp trước.</p>
      ) : (
        <BulkGrid
          students={students}
          year={period.year}
          month={period.month}
          initialChecked={initialChecked}
          classId={classId}
          subjectIndex={subjectIndex}
          action={saveBulkAttendanceAction}
        />
      )}
    </div>
  );
}
