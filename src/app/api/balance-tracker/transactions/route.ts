import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema/balance-tracker";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, user.id));

  return NextResponse.json(
    rows.map((r: typeof rows[number]) => ({
      id: r.id,
      sourceName: r.sourceName,
      amount: Number(r.amount),
      date: r.date,
      type: r.type,
      payPeriod: r.payPeriod,
    }))
  );
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = randomUUID();

  await db.insert(transactions).values({
    id,
    userId: user.id,
    sourceName: body.sourceName,
    amount: String(body.amount),
    date: body.date,
    type: body.type,
    payPeriod: body.payPeriod,
  });

  return NextResponse.json({ id, ...body }, { status: 201 });
}
