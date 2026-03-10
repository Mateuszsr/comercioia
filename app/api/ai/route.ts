// app/api/ai/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const storeId = session?.user ? (session.user as any).storeId : null;
  if (!storeId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { message, context } = await req.json();
  if (!message) return NextResponse.json({ error: "Mensagem obrigatória" }, { status: 400 });

  const systemPrompt = `Você é um assistente de negócios inteligente para pequenos comércios. 
Analise os dados do negócio fornecidos e responda de forma prática, objetiva e útil em português brasileiro.
Use emojis para deixar a resposta mais visual e fácil de ler.
Seja direto, dê sugestões concretas e acionáveis.
Não repita os dados brutos — interprete-os e gere valor.

Dados atuais do negócio:
${JSON.stringify(context, null, 2)}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as any).text)
      .join("");

    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: "Erro ao chamar IA: " + e.message }, { status: 500 });
  }
}
