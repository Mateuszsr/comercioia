// app/api/insights/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const storeId = session?.user ? (session.user as any).storeId : null;
  if (!storeId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const prevSevenStart = new Date(sevenDaysAgo);
  prevSevenStart.setDate(prevSevenStart.getDate() - 7);

  const [sales30, sales7, salesPrev7, products, clients] = await Promise.all([
    prisma.sale.findMany({
      where: { storeId, createdAt: { gte: thirtyDaysAgo } },
      include: { items: { include: { product: true } }, client: true },
    }),
    prisma.sale.findMany({
      where: { storeId, createdAt: { gte: sevenDaysAgo } },
      include: { items: { include: { product: true } } },
    }),
    prisma.sale.findMany({
      where: { storeId, createdAt: { gte: prevSevenStart, lt: sevenDaysAgo } },
    }),
    prisma.product.findMany({ where: { storeId } }),
    prisma.client.findMany({
      where: { storeId },
      include: { sales: { where: { createdAt: { gte: thirtyDaysAgo } } } },
    }),
  ]);

  // Revenue
  const revenue30 = sales30.reduce((s, v) => s + v.total, 0);
  const revenue7 = sales7.reduce((s, v) => s + v.total, 0);
  const revenuePrev7 = salesPrev7.reduce((s, v) => s + v.total, 0);
  const revenueTrend = revenuePrev7 > 0 ? ((revenue7 - revenuePrev7) / revenuePrev7) * 100 : 0;

  // Top products
  const productCount: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const sale of sales30) {
    for (const item of sale.items) {
      if (!productCount[item.productId]) {
        productCount[item.productId] = { name: item.product.name, qty: 0, revenue: 0 };
      }
      productCount[item.productId].qty += item.quantity;
      productCount[item.productId].revenue += item.price * item.quantity;
    }
  }
  const topProducts = Object.values(productCount).sort((a, b) => b.qty - a.qty);

  // Top clients
  const topClients = clients
    .map((c) => ({ name: c.name, id: c.id, visits: c.sales.length }))
    .filter((c) => c.visits > 0)
    .sort((a, b) => b.visits - a.visits);

  // Sales by day of week
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const salesByDay = Array(7).fill(0);
  for (const sale of sales30) {
    salesByDay[new Date(sale.createdAt).getDay()]++;
  }
  const salesByDayData = dayNames.map((name, i) => ({ name, value: salesByDay[i] }));

  // Sales by hour
  const salesByHour = Array(24).fill(0);
  for (const sale of sales30) {
    salesByHour[new Date(sale.createdAt).getHours()]++;
  }
  const peakHour = salesByHour.indexOf(Math.max(...salesByHour));

  // Low stock alerts
  const lowStock = products.filter((p) => p.stock <= p.minStock);

  // Combo detection (products bought together in same sale)
  const comboCount: Record<string, number> = {};
  for (const sale of sales30) {
    const prods = sale.items.map((i) => i.product.name).sort();
    for (let i = 0; i < prods.length; i++) {
      for (let j = i + 1; j < prods.length; j++) {
        const key = `${prods[i]} + ${prods[j]}`;
        comboCount[key] = (comboCount[key] || 0) + 1;
      }
    }
  }
  const topCombos = Object.entries(comboCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([combo, count]) => ({ combo, count }));

  // Sales last 7 days (for mini chart)
  const salesLast7: { date: string; revenue: number; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("pt-BR", { weekday: "short" });
    const daySales = sales30.filter((s) => {
      const sd = new Date(s.createdAt);
      return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth();
    });
    salesLast7.push({
      date: dateStr,
      revenue: daySales.reduce((s, v) => s + v.total, 0),
      count: daySales.length,
    });
  }

  return NextResponse.json({
    revenue30,
    revenue7,
    revenueTrend: Math.round(revenueTrend),
    totalSales30: sales30.length,
    totalSales7: sales7.length,
    topProducts: topProducts.slice(0, 5),
    topClients: topClients.slice(0, 5),
    salesByDay: salesByDayData,
    peakHour,
    lowStock,
    topCombos,
    salesLast7,
  });
}
