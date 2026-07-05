import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      centerId: string;
      role: string;
    } & DefaultSession["user"];
  }
}
