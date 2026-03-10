// app/api/sales/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getStoreId(session: any) {
  return session?.user?.storeId as string | undefined;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const storeId = getStoreId(session);
  if (!storeId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const days = parseInt(searchParams.get("days") || "30");
  const since = new Date();
  since.setDate(since.getDate() - days);

  const sales = await prisma.sale.findMany({
    where: { storeId, createdAt: { gte: since } },
    include: { client: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(sales);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const storeId = getStoreId(session);
  if (!storeId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { clientId, items } = await req.json();
  // items: [{ productId, quantity }]
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Itens obrigatórios" }, { status: 400 });
  }

  // Fetch prices from DB
  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, storeId },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: "Produto inválido" }, { status: 400 });
  }

  const priceMap = Object.fromEntries(products.map((p) => [p.id, p.price]));
  const total = items.reduce(
    (sum: number, i: any) => sum + priceMap[i.productId] * i.quantity,
    0
  );

  const sale = await prisma.sale.create({
    data: {
      storeId,
      clientId: clientId || null,
      total,
      items: {
        create: items.map((i: any) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: priceMap[i.productId],
        })),
      },
    },
    include: { client: true, items: { include: { product: true } } },
  });

  // Decrement stock
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  return NextResponse.json(sale, { status: 201 });
}
