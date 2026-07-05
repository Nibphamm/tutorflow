// Tháng/Năm áp dụng toàn dashboard — đọc từ URL searchParams, có default = hiện tại.

export interface Period {
  month: number; // 1-12
  year: number;
}

export function resolvePeriod(searchParams: {
  month?: string;
  year?: string;
}): Period {
  const now = new Date();
  const month = Number(searchParams.month) || now.getMonth() + 1;
  const year = Number(searchParams.year) || now.getFullYear();
  return { month, year };
}

export function monthRange(period: Period): { start: Date; end: Date } {
  const start = new Date(period.year, period.month - 1, 1);
  const end = new Date(period.year, period.month, 0); // ngày cuối tháng
  return { start, end };
}

export function daysInMonth(period: Period): number {
  return new Date(period.year, period.month, 0).getDate();
}
