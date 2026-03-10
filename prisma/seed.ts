// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("demo123", 10);

  const store = await prisma.store.upsert({
    where: { email: "demo@comercioia.com" },
    update: {},
    create: {
      name: "Loja Demo",
      type: "generic",
      email: "demo@comercioia.com",
      password: hashed,
    },
  });

  const products = await Promise.all([
    prisma.product.upsert({ where: { id: "prod1" }, update: {}, create: { id: "prod1", name: "Produto A", price: 45, stock: 40, minStock: 10, storeId: store.id } }),
    prisma.product.upsert({ where: { id: "prod2" }, update: {}, create: { id: "prod2", name: "Produto B", price: 42, stock: 25, minStock: 10, storeId: store.id } }),
    prisma.product.upsert({ where: { id: "prod3" }, update: {}, create: { id: "prod3", name: "Produto C", price: 8, stock: 50, minStock: 15, storeId: store.id } }),
    prisma.product.upsert({ where: { id: "prod4" }, update: {}, create: { id: "prod4", name: "Produto D", price: 48, stock: 8, minStock: 10, storeId: store.id } }),
  ]);

  const clients = await Promise.all([
    prisma.client.upsert({ where: { id: "cli1" }, update: {}, create: { id: "cli1", name: "João Silva", phone: "11999990001", storeId: store.id } }),
    prisma.client.upsert({ where: { id: "cli2" }, update: {}, create: { id: "cli2", name: "Maria Souza", phone: "11999990002", storeId: store.id } }),
    prisma.client.upsert({ where: { id: "cli3" }, update: {}, create: { id: "cli3", name: "Pedro Costa", phone: "11999990003", storeId: store.id } }),
  ]);

  // Create sample sales spread over the last 14 days
  const now = new Date();
  const salesData = [
    { daysAgo: 0, clientIdx: 0, items: [{ prodIdx: 0, qty: 1 }, { prodIdx: 2, qty: 2 }] },
    { daysAgo: 0, clientIdx: 1, items: [{ prodIdx: 1, qty: 1 }] },
    { daysAgo: 1, clientIdx: 0, items: [{ prodIdx: 0, qty: 1 }] },
    { daysAgo: 1, clientIdx: 2, items: [{ prodIdx: 2, qty: 3 }, { prodIdx: 3, qty: 1 }] },
    { daysAgo: 2, clientIdx: 1, items: [{ prodIdx: 0, qty: 2 }, { prodIdx: 2, qty: 1 }] },
    { daysAgo: 3, clientIdx: 0, items: [{ prodIdx: 3, qty: 1 }] },
    { daysAgo: 4, clientIdx: 2, items: [{ prodIdx: 0, qty: 1 }, { prodIdx: 1, qty: 1 }] },
    { daysAgo: 5, clientIdx: 1, items: [{ prodIdx: 2, qty: 4 }] },
    { daysAgo: 6, clientIdx: 0, items: [{ prodIdx: 0, qty: 1 }] },
    { daysAgo: 7, clientIdx: 2, items: [{ prodIdx: 1, qty: 2 }, { prodIdx: 2, qty: 1 }] },
    { daysAgo: 8, clientIdx: 1, items: [{ prodIdx: 0, qty: 1 }] },
    { daysAgo: 10, clientIdx: 0, items: [{ prodIdx: 3, qty: 2 }] },
    { daysAgo: 12, clientIdx: 2, items: [{ prodIdx: 0, qty: 1 }, { prodIdx: 2, qty: 2 }] },
    { daysAgo: 14, clientIdx: 1, items: [{ prodIdx: 1, qty: 1 }] },
  ];

  for (const s of salesData) {
    const date = new Date(now);
    date.setDate(date.getDate() - s.daysAgo);
    const total = s.items.reduce((sum, i) => sum + products[i.prodIdx].price * i.qty, 0);
    await prisma.sale.create({
      data: {
        storeId: store.id,
        clientId: clients[s.clientIdx].id,
        total,
        createdAt: date,
        items: {
          create: s.items.map(i => ({
            productId: products[i.prodIdx].id,
            quantity: i.qty,
            price: products[i.prodIdx].price,
          })),
        },
      },
    });
  }

  console.log("✅ Seed concluído! Login: demo@comercioia.com / demo123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
