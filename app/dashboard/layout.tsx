import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { MonthYearPicker } from "@/components/month-year-picker";
import { signOutAction } from "./actions";

const NAV = [
  { href: "/dashboard/students", label: "Học sinh" },
  { href: "/dashboard/classes", label: "Lớp" },
  { href: "/dashboard/attendance", label: "Điểm Danh" },
  { href: "/dashboard/remarks", label: "Nhận Xét" },
  { href: "/dashboard/settings", label: "Thiết lập" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const center = session?.user.centerId
    ? await prisma.center.findUnique({ where: { id: session.user.centerId } })
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-900">
              {center?.displayName || center?.name || "TutorFlow"}
            </span>
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">
              MVP
            </span>
          </div>
          <Suspense fallback={null}>
            <MonthYearPicker />
          </Suspense>
          <form action={signOutAction}>
            <button className="text-sm text-slate-500 hover:text-slate-900">
              Đăng xuất
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-4 px-4 pb-2 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-slate-600 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
