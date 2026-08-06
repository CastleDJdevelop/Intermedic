import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  const { userId, username, name, role } = session;
  return NextResponse.json({ user: { id: userId, username, name, role } });
}
