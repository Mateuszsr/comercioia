// app/api/products/route.ts
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

  const products = await prisma.product.findMany({
    where: { storeId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const storeId = getStoreId(session);
  if (!storeId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { name, price, stock, minStock } = await req.json();
  if (!name || price === undefined) {
    return NextResponse.json({ error: "Nome e preço obrigatórios" }, { status: 400 });
  }
  const product = await prisma.product.create({
    data: { name, price: parseFloat(price), stock: parseInt(stock || 0), minStock: parseInt(minStock || 5), storeId },
  });
  return NextResponse.json(product, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const storeId = getStoreId(session);
  if (!storeId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id, name, price, stock, minStock } = await req.json();
  const product = await prisma.product.updateMany({
    where: { id, storeId },
    data: { name, price: parseFloat(price), stock: parseInt(stock), minStock: parseInt(minStock || 5) },
  });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const storeId = getStoreId(session);
  if (!storeId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await req.json();
  await prisma.product.deleteMany({ where: { id, storeId } });
  return NextResponse.json({ ok: true });
}
