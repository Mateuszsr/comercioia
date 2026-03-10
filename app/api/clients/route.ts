// app/api/clients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getStoreId(session: any) {
  return session?.user?.storeId as string | undefined;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const storeId = getStoreId(session);
  if (!storeId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { storeId },
    include: { _count: { select: { sales: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const storeId = getStoreId(session);
  if (!storeId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { name, phone, email } = await req.json();
  if (!name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

  const client = await prisma.client.create({
    data: { name, phone: phone || null, email: email || null, storeId },
  });
  return NextResponse.json(client, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const storeId = getStoreId(session);
  if (!storeId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await req.json();
  await prisma.client.deleteMany({ where: { id, storeId } });
  return NextResponse.json({ ok: true });
}
