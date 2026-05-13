import { getUser } from "@/lib/auth/get-user";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema/balance-tracker";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  await db
    .update(transactions)
    .set({
      sourceName: body.sourceName,
      amount: String(body.amount),
      date: body.date,
      type: body.type,
      payPeriod: body.payPeriod,
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

  return NextResponse.json({ id, ...body });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

  return new NextResponse(null, { status: 204 });
}
