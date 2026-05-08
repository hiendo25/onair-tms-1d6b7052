import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

type Props = {
  lessonTitle: string;
  lessonContent?: string;
};

export function LessonChatbot({ lessonTitle, lessonContent }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-chat-lesson", {
        body: {
          lessonTitle,
          lessonContent: lessonContent ?? "",
          messages: newMessages,
        },
      });
      if (fnErr) throw fnErr;
      setMessages([...newMessages, { role: "assistant", content: (res as { reply: string }).reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Xin lỗi, có lỗi xảy ra. Bạn thử lại nhé." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Float button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg flex items-center justify-center hover:opacity-90 transition"
        title="Hỏi AI về bài học"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 rounded-xl border bg-white shadow-2xl flex flex-col" style={{ maxHeight: "420px" }}>
          {/* Header */}
          <div className="flex items-center gap-2 p-3 border-b bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-t-xl">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-white font-semibold text-sm flex-1 truncate">Trợ lý bài học</span>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 0 }}>
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-4 space-y-1">
                <Sparkles className="h-8 w-8 mx-auto text-violet-300" />
                <p>Hỏi mình bất kỳ điều gì về bài</p>
                <p className="font-medium text-violet-700 text-xs">"{lessonTitle}"</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-violet-600 text-white rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t flex gap-1.5">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Đặt câu hỏi..."
              className="text-sm h-8"
              disabled={loading}
            />
            <Button size="sm" className="h-8 w-8 p-0 bg-violet-600 hover:bg-violet-700" onClick={send} disabled={loading || !input.trim()}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
