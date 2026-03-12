import { NextResponse } from "next/server";
import {
  buildChatSystemPrompt,
  MOONSHOT_FALLBACK_MODELS,
  OPENROUTER_FALLBACK_MODELS,
  parseStructuredChatResponse,
  type ChatApiMessage,
} from "@/lib/ai-chat";

type ChatCompletionPayload = {
  choices?: Array<{ message?: { content?: string } }>;
};

async function requestChatCompletion(input: {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ChatApiMessage[];
  includeResponseFormat?: boolean;
}) {
  const upstream = await fetch(input.baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      temperature: 0.6,
      ...(input.includeResponseFormat ? { response_format: { type: "json_object" } } : {}),
      messages: [
        {
          role: "system",
          content: buildChatSystemPrompt(),
        },
        ...input.messages,
      ],
    }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    return {
      ok: false as const,
      error: (await upstream.text()) || `Upstream AI request failed for ${input.model}.`,
    };
  }

  const payload = (await upstream.json()) as ChatCompletionPayload;
  const raw = payload.choices?.[0]?.message?.content || "";
  const parsed = parseStructuredChatResponse(raw);

  if (!parsed) {
    return {
      ok: false as const,
      error: `AI returned invalid JSON for ${input.model}.`,
    };
  }

  return { ok: true as const, data: parsed };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: ChatApiMessage[] };
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const safeMessages = messages
      .filter((message) => (message.role === "user" || message.role === "assistant") && typeof message.content === "string")
      .slice(-12);

    let lastError = "AI is temporarily unavailable.";

    const moonshotApiKey = process.env.MOONSHOT_API_KEY;
    if (moonshotApiKey) {
      for (const model of MOONSHOT_FALLBACK_MODELS) {
        const result = await requestChatCompletion({
          baseUrl: "https://api.moonshot.ai/v1/chat/completions",
          apiKey: moonshotApiKey,
          model,
          messages: safeMessages,
          includeResponseFormat: false,
        });
        if (result.ok) {
          return NextResponse.json(result.data);
        }
        lastError = result.error;
      }
    }

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (openrouterApiKey) {
      for (const model of OPENROUTER_FALLBACK_MODELS) {
        const result = await requestChatCompletion({
          baseUrl: "https://openrouter.ai/api/v1/chat/completions",
          apiKey: openrouterApiKey,
          model,
          messages: safeMessages,
          includeResponseFormat: true,
        });
        if (result.ok) {
          return NextResponse.json(result.data);
        }
        lastError = result.error;
      }
    }

    if (!moonshotApiKey && !openrouterApiKey) {
      return NextResponse.json({ error: "Configure MOONSHOT_API_KEY or OPENROUTER_API_KEY." }, { status: 500 });
    }

    return NextResponse.json({ error: lastError }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "AI is temporarily unavailable." }, { status: 500 });
  }
}
