"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import { Button, Card, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
            TF
          </div>
          <h1 className="text-lg font-semibold text-slate-900">TutorFlow</h1>
          <p className="text-sm text-slate-500">Điểm Danh — Hệ thống quản lý trung tâm</p>
        </div>

        <Card>
          <form action={action} className="space-y-4">
            <Field label="Email">
              <Input name="email" type="email" required autoComplete="username" />
            </Field>
            <Field label="Mật khẩu">
              <Input name="password" type="password" required autoComplete="current-password" />
            </Field>

            {state?.error && (
              <p role="alert" className="text-sm text-red-600">
                {state.error}
              </p>
            )}

            <Button type="submit" variant="primary" disabled={pending} className="w-full">
              {pending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-medium text-indigo-600 hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
