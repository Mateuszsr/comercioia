// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, type } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }
    const exists = await prisma.store.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const store = await prisma.store.create({
      data: { name, email, password: hashed, type: type || "generic" },
    });
    return NextResponse.json({ id: store.id, name: store.name, email: store.email }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
