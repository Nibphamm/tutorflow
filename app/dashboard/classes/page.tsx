import { prisma } from "@/lib/db";
import { requireCenterId } from "@/lib/auth-helpers";
import { ClassForm } from "./class-form";
import { deleteClassAction } from "./actions";

export default async function ClassesPage() {
  const centerId = await requireCenterId();
  const classes = await prisma.class.findMany({
    where: { centerId },
    include: { _count: { select: { students: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Quản lý lớp</h1>
      <ClassForm />
      <table className="w-full overflow-hidden rounded-lg bg-white text-sm shadow">
        <thead className="bg-slate-100 text-left text-slate-600">
          <tr>
            <th className="px-4 py-2">Lớp</th>
            <th className="px-4 py-2">Số học sinh</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c.id} className="border-t border-slate-100">
              <td className="px-4 py-2">{c.name}</td>
              <td className="px-4 py-2">{c._count.students}</td>
              <td className="px-4 py-2 text-right">
                <form action={deleteClassAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-red-600 hover:underline">Xoá</button>
                </form>
              </td>
            </tr>
          ))}
          {classes.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                Chưa có lớp nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
