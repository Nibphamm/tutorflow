import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { DayForm } from "./day-form";
import { saveDayAttendanceAction } from "./actions";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string; subjectIndex?: string }>;
}) {
  const sp = await searchParams;
  const centerId = await requireCenterId();
  const classes = await prisma.class.findMany({ where: { centerId }, orderBy: { name: "asc" } });

  const classId = sp.classId || classes[0]?.id || "";
  const date = sp.date || todayStr();
  const subjectIndex = Number(sp.subjectIndex || 0);

  let studentRows: { id: string; name: string; present: boolean | null }[] = [];
  if (classId) {
    const students = await prisma.student.findMany({
      where: { classId, centerId },
      orderBy: { name: "asc" },
    });
    const attendances = await prisma.attendance.findMany({
      where: {
        studentId: { in: students.map((s) => s.id) },
        date: new Date(`${date}T00:00:00.000Z`),
        subjectIndex,
      },
    });
    const presentMap = new Map(attendances.map((a) => [a.studentId, a.present]));
    studentRows = students.map((s) => ({
      id: s.id,
      name: s.name,
      present: presentMap.has(s.id) ? presentMap.get(s.id)! : null,
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Điểm Danh theo ngày</h1>
        <Link
          href="/dashboard/attendance/bulk"
          className="text-sm text-slate-600 underline hover:text-slate-900"
        >
          📋 Điểm danh hàng loạt →
        </Link>
      </div>

      <form className="flex gap-2" method="get">
        <select name="classId" defaultValue={classId} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="date"
          defaultValue={date}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select name="subjectIndex" defaultValue={subjectIndex} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value={0}>Buổi 1</option>
          <option value={1}>Buổi 2</option>
        </select>
        <button className="rounded-md border border-slate-300 px-3 py-2 text-sm">Xem</button>
      </form>

      {classes.length === 0 ? (
        <p className="text-slate-500">Chưa có lớp nào, tạo lớp trước.</p>
      ) : (
        <DayForm date={date} subjectIndex={subjectIndex} students={studentRows} action={saveDayAttendanceAction} />
      )}
    </div>
  );
}
