"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UsersIcon,
  LayersIcon,
  CalendarCheckIcon,
  MessageSquareIcon,
  SettingsIcon,
} from "@/components/icons";

const NAV = [
  { href: "/dashboard/students", label: "Học sinh", icon: UsersIcon },
  { href: "/dashboard/classes", label: "Lớp", icon: LayersIcon },
  { href: "/dashboard/attendance", label: "Điểm Danh", icon: CalendarCheckIcon },
  { href: "/dashboard/remarks", label: "Nhận Xét", icon: MessageSquareIcon },
  { href: "/dashboard/settings", label: "Thiết lập", icon: SettingsIcon },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto px-1 sm:px-0">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
              (active
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
