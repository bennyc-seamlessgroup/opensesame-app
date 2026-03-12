"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Mic, SendHorizontal } from "lucide-react";
import { AiFoodSuggestionCard } from "@/components/ai-food-suggestion-card";
import { ExploreRestaurantCard } from "@/components/explore-restaurant-card";
import { FoodIntentCard } from "@/components/food-intent-card";
import { TopFoodieCard } from "@/components/top-foodie-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildFoodieSuggestionPayload,
  buildRestaurantSuggestionPayload,
  type ChatApiMessage,
  type ChatApiResponse,
} from "@/lib/ai-chat";
import { foodIntents } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  cards?: ChatApiResponse["cards"];
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous?: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend?: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const SESSION_STORAGE_KEY = "oeats-ai-chat-session";

const starterMessages: UiMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Tell me what you want to eat, your budget, mood, or area. I’ll suggest matching restaurants from the app.",
  },
];

export function AiChatClient() {
  const { locale, tx } = useI18n();
  const [messages, setMessages] = useState<UiMessage[]>(starterMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [dictationHint, setDictationHint] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!dictationHint) return;
    const timer = window.setTimeout(() => setDictationHint(""), 2200);
    return () => window.clearTimeout(timer);
  }, [dictationHint]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as UiMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
    } catch {}
  }, []);

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const apiMessages = useMemo<ChatApiMessage[]>(
    () => messages.map((message) => ({ role: message.role, content: message.text })),
    [messages]
  );

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: UiMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...apiMessages, { role: "user", content: trimmed }],
        }),
      });

      const data = (await response.json()) as ChatApiResponse & { error?: string };
      if (!response.ok) throw new Error(data.error || "AI request failed");
      if (typeof data.reply !== "string" || !Array.isArray(data.cards)) throw new Error("Invalid AI payload");

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: data.reply,
          cards: data.cards,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant-fallback`,
          role: "assistant",
          text:
            error instanceof Error && error.message
              ? error.message
              : locale === "zh-HK"
                ? "AI 暫時未能回應，請稍後再試。"
                : "AI is temporarily unavailable. Please try again shortly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMic = () => {
    inputRef.current?.focus();

    const speechApi =
      typeof window !== "undefined"
        ? ((window as Window & {
            SpeechRecognition?: new () => SpeechRecognitionLike;
            webkitSpeechRecognition?: new () => SpeechRecognitionLike;
          }).SpeechRecognition ||
            (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition)
        : undefined;

    if (!speechApi) {
      setDictationHint(locale === "zh-HK" ? "請點鍵盤上的咪高峰進行語音輸入" : "Tap the keyboard mic to dictate");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setDictationHint(locale === "zh-HK" ? "已停止語音輸入" : "Stopped listening");
      return;
    }

    const recognition = new speechApi();
    recognition.lang = locale === "zh-HK" ? "zh-HK" : "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i]?.[0]?.transcript || "";
      }
      setInput(transcript.trim());
    };
    recognition.onerror = () => {
      setIsListening(false);
      setDictationHint(locale === "zh-HK" ? "語音輸入暫時不可用" : "Voice input is unavailable");
    };
    recognition.onend = () => {
      setIsListening(false);
      setDictationHint(locale === "zh-HK" ? "語音已轉成文字，可再修改後發送" : "Speech converted to text. Edit before sending.");
    };
    recognitionRef.current = recognition;
    setIsListening(true);
    setDictationHint(locale === "zh-HK" ? "請開始說話…" : "Listening…");
    recognition.start();
  };

  return (
    <div className="-mx-4 -my-4 flex min-h-[calc(100dvh-2rem)] flex-col bg-background">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur">
        <Button asChild type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Link href="/ai" aria-label={tx("Back")}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <p className="text-sm font-semibold text-foreground">OEats AI Assistant</p>
          <p className="text-xs text-muted-foreground">
            {locale === "zh-HK" ? "聊天搵餐廳同菜式" : "Chat for restaurant and dish suggestions"}
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3">
          {messages.map((message) => {
            const cards = (message.cards || []).slice(0, 3);

            return (
              <div key={message.id} className={`flex flex-col gap-2 ${message.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    message.role === "user"
                      ? "rounded-br-md bg-orange-500 text-white"
                      : "rounded-bl-md bg-card text-foreground border border-border/70"
                  }`}
                >
                  {message.text}
                </div>

                {message.role === "assistant" && cards.length > 0 ? (
                  <div className="w-full max-w-[92%] space-y-3">
                    {cards.map((card) => {
                      if (card.type === "restaurant") {
                        const item = buildRestaurantSuggestionPayload(card.id);
                        return item ? (
                          item.intent && item.review ? (
                            <AiFoodSuggestionCard
                              key={`${message.id}-restaurant-${item.restaurant.id}`}
                              intent={item.intent}
                              restaurant={item.restaurant}
                              review={item.review}
                              serviceMode={item.serviceMode}
                            />
                          ) : (
                            <ExploreRestaurantCard
                              key={`${message.id}-restaurant-${item.restaurant.id}`}
                              restaurant={item.restaurant}
                              mode={item.serviceMode}
                            />
                          )
                        ) : null;
                      }

                      if (card.type === "food") {
                        const intent = foodIntents.find((item) => item.id === card.id);
                        return intent ? <FoodIntentCard key={`${message.id}-food-${intent.id}`} intent={intent} /> : null;
                      }

                      if (card.type === "foodie") {
                        const foodie = buildFoodieSuggestionPayload(card.id);
                        return foodie ? (
                          <TopFoodieCard
                            key={`${message.id}-foodie-${foodie.userId}`}
                            userId={foodie.userId}
                            username={foodie.username}
                            avatar={foodie.avatar}
                            credibilityScore={foodie.credibilityScore}
                            followersCount={foodie.followersCount}
                          />
                        ) : null;
                      }

                      return null;
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}

          {isLoading ? (
            <div className="flex items-start">
              <div className="rounded-2xl rounded-bl-md border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                {locale === "zh-HK" ? "AI 正在輸入…" : "AI is typing…"}
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </main>

      <div className="sticky bottom-0 border-t border-border/70 bg-background/95 px-3 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[640px] items-center gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder={locale === "zh-HK" ? "輸入你想食咩…" : "Type what you want to eat…"}
              className="h-11 rounded-full pr-4"
            />
            {dictationHint ? (
              <p className="mt-1 px-2 text-[11px] text-muted-foreground">{dictationHint}</p>
            ) : null}
          </div>
          <Button
            type="button"
            size="icon"
            className="h-11 w-11 rounded-full"
            onClick={() => void sendMessage()}
            disabled={!input.trim() || isLoading}
            aria-label={locale === "zh-HK" ? "發送" : "Send"}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={isListening ? "default" : "secondary"}
            className="h-11 w-11 rounded-full"
            onClick={handleMic}
            aria-label={locale === "zh-HK" ? "語音輸入" : "Voice input"}
          >
            {isListening ? <Bot className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
