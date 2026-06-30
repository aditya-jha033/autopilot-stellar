import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { redirect } from "next/navigation";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/onboarding");
  const payload = await verifyToken(token);
  if (!payload) redirect("/onboarding");
  return payload;
}
