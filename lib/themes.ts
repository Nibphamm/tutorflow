// 5 theme màu Phiếu Học Phí — cố định, không cần bảng DB riêng.

export interface InvoiceTheme {
  id: string;
  label: string;
  gradient: string; // Tailwind classes cho nền thẻ
  accent: string; // Tailwind text/border accent
}

export const INVOICE_THEMES: InvoiceTheme[] = [
  { id: "default", label: "Mặc định", gradient: "from-slate-700 to-slate-900", accent: "text-slate-100" },
  { id: "strawberry", label: "Dâu Tây", gradient: "from-rose-400 to-pink-600", accent: "text-rose-50" },
  { id: "lavender", label: "Oải Hương", gradient: "from-violet-400 to-purple-600", accent: "text-violet-50" },
  { id: "ocean", label: "Đại Dương", gradient: "from-cyan-500 to-blue-700", accent: "text-cyan-50" },
  { id: "luxury", label: "Sang Trọng", gradient: "from-amber-500 to-yellow-700", accent: "text-amber-50" },
];

export function getTheme(id: string | null | undefined): InvoiceTheme {
  return INVOICE_THEMES.find((t) => t.id === id) ?? INVOICE_THEMES[0];
}
