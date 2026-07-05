// Core học phí — dùng chung cho danh sách HS, phiếu, (sau này) thu nợ.
// Tách khỏi Prisma types để test chạy không cần DB. Tiền = int VNĐ.

export type FeeModel = "FIXED" | "PER_SESSION";

export interface StudentFee {
  feeModel: FeeModel;
  fixedFee?: number | null;
  subject1Name?: string | null;
  subject1Price?: number | null;
  subject2Name?: string | null;
  subject2Price?: number | null;
}

export interface AttendanceLite {
  present: boolean;
  subjectIndex: number;
}

export interface SubjectLine {
  name: string;
  price: number;
  sessions: number;
  amount: number;
}

export interface TuitionResult {
  subjects: SubjectLine[];
  total: number;
}

export function computeTuition(
  student: StudentFee,
  attendances: AttendanceLite[]
): TuitionResult {
  if (student.feeModel === "FIXED") {
    const total = student.fixedFee ?? 0;
    return {
      subjects: [{ name: "Học phí cố định", price: total, sessions: 1, amount: total }],
      total,
    };
  }

  // PER_SESSION: đếm buổi present theo từng môn (subjectIndex)
  const present = attendances.filter((a) => a.present);
  const defs = [
    { name: student.subject1Name || "Buổi 1", price: student.subject1Price ?? 0, idx: 0 },
    { name: student.subject2Name || "Buổi 2", price: student.subject2Price ?? 0, idx: 1 },
  ];

  const subjects: SubjectLine[] = [];
  for (const d of defs) {
    // môn 2 chỉ tính nếu có cấu hình tên
    if (d.idx === 1 && !student.subject2Name) continue;
    const sessions = present.filter((a) => a.subjectIndex === d.idx).length;
    subjects.push({ name: d.name, price: d.price, sessions, amount: sessions * d.price });
  }

  const total = subjects.reduce((s, x) => s + x.amount, 0);
  return { subjects, total };
}

export function formatVnd(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}
