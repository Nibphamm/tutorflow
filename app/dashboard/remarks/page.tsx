import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { saveRemarksAction } from "./actions";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function RemarksPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>;
}) {
  const sp = await searchParams;
  const centerId = await requireCenterId();
  const [classes, center] = await Promise.all([
    prisma.class.findMany({ where: { centerId }, orderBy: { name: "asc" } }),
    prisma.center.findUnique({ where: { id: centerId } }),
  ]);
  const classId = sp.classId || classes[0]?.id || "";
  const date = sp.date || todayStr();

  let rows: {
    id: string;
    name: string;
    score1: number | null;
    score2: number | null;
    comment: string | null;
    status: "DRAFT" | "SENT" | null;
  }[] = [];

  if (classId) {
    const students = await prisma.student.findMany({
      where: { classId, centerId },
      orderBy: { name: "asc" },
    });
    const remarks = await prisma.remark.findMany({
      where: {
        studentId: { in: students.map((s) => s.id) },
        date: new Date(`${date}T00:00:00.000Z`),
      },
    });
    const byStudent = new Map(remarks.map((r) => [r.studentId, r]));
    rows = students.map((s) => {
      const r = byStudent.get(s.id);
      return {
        id: s.id,
        name: s.name,
        score1: r?.score1 ?? null,
        score2: r?.score2 ?? null,
        comment: r?.comment ?? null,
        status: r?.status ?? null,
      };
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Nhận Xét</h1>

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
        <button className="rounded-md border border-slate-300 px-3 py-2 text-sm">Xem</button>
      </form>

      {classes.length === 0 ? (
        <p className="text-slate-500">Chưa có lớp nào, tạo lớp trước.</p>
      ) : (
        <form action={saveRemarksAction} className="space-y-4">
          <input type="hidden" name="date" value={date} />
          {rows.map((r) => (
            <input key={r.id} type="hidden" name="studentId" value={r.id} />
          ))}

          <table className="w-full overflow-hidden rounded-lg bg-white text-sm shadow">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-4 py-2">Học sinh</th>
                <th className="px-4 py-2">{center?.remarkLabel1 ?? "Điểm 1"}</th>
                <th className="px-4 py-2">{center?.remarkLabel2 ?? "Điểm 2"}</th>
                <th className="px-4 py-2">Nhận xét</th>
                <th className="px-4 py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium">{r.name}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      name={`score1-${r.id}`}
                      defaultValue={r.score1 ?? ""}
                      className="w-16 rounded-md border border-slate-300 px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      name={`score2-${r.id}`}
                      defaultValue={r.score2 ?? ""}
                      className="w-16 rounded-md border border-slate-300 px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      name={`comment-${r.id}`}
                      defaultValue={r.comment ?? ""}
                      className="w-full rounded-md border border-slate-300 px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {r.status === "SENT" ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">Đã gửi</span>
                    ) : r.status === "DRAFT" ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">Nháp</span>
                    ) : (
                      <span className="text-slate-400">Chưa có</span>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Lớp chưa có học sinh
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {rows.length > 0 && (
            <div className="flex gap-2">
              <button
                type="submit"
                name="intent"
                value="draft"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Lưu Tạm
              </button>
              <button
                type="submit"
                name="intent"
                value="sent"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                🚀 Gửi Điểm
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
