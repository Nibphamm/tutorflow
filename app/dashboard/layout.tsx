import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { MonthYearPicker } from "@/components/month-year-picker";
import { NavLinks } from "@/components/nav-links";
import { LogOutIcon } from "@/components/icons";
import { signOutAction } from "./actions";

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
    <div className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              TF
            </div>
            <span className="truncate font-semibold text-slate-900">
              {center?.displayName || center?.name || "TutorFlow"}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Suspense fallback={null}>
              <MonthYearPicker />
            </Suspense>
            <form action={signOutAction}>
              <button
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Đăng xuất"
                title="Đăng xuất"
              >
                <LogOutIcon />
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-2 pb-2 sm:px-4">
          <NavLinks />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
