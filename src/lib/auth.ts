// src/lib/auth.ts
import { getServerSession } from "next-auth";

export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Não autenticado");
  }
  return user;
}