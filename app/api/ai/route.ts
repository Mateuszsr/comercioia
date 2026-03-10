import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    if (!message) return NextResponse.json({ error: "Mensagem obrigatória" }, { status: 400 });

    const systemPrompt = `Você é um assistente de negócios inteligente para pequenos comércios. 
Analise os dados do negócio fornecidos e responda de forma prática, objetiva e útil em português brasileiro.
Use emojis para deixar a resposta mais visual e fácil de ler.
Seja direto, dê sugestões concretas e acionáveis.
Não repita os dados brutos — interprete-os e gere valor.

Dados atuais do negócio:
${JSON.stringify(context, null, 2)}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    const text = data.content
      ?.filter((b: { type: string }) => b.type === "text")
      .map((b: { type: string; text: string }) => b.text)
      .join("") ?? "Erro ao processar resposta.";

    return NextResponse.json({ text });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
