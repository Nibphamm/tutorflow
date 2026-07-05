import { auth } from "@/auth";

export async function requireCenterId(): Promise<string> {
  const session = await auth();
  if (!session?.user.centerId) throw new Error("Unauthorized");
  return session.user.centerId;
}
