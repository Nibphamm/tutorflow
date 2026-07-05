"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn } from "@/auth";

const schema = z.object({
  centerName: z.string().min(1, "Tên trung tâm không được để trống"),
  name: z.string().min(1, "Tên hiển thị không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export type RegisterState = { error?: string } | undefined;

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = schema.safeParse({
    centerName: formData.get("centerName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { centerName, name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email đã được sử dụng" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const center = await tx.center.create({ data: { name: centerName } });
    await tx.user.create({
      data: { email, passwordHash, name, role: "OWNER", centerId: center.id },
    });
  });

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}
