import { SendHorizonal } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/utils";
import type { ChatMessage } from "@/types/communication";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

const senderClasses = {
  system: "bg-slate-100 text-slate-700",
  operator: "bg-slate-900 text-white",
  visitor: "bg-sky-100 text-sky-700",
};

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [message, setMessage] = useState("");

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
      ),
    [messages],
  );

  const submitMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage("");
  };

  return (
    <div className="card-elevated flex h-full flex-col p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Live Chat</h2>
        <p className="text-sm text-muted-foreground">
          Keep written context during calls and support handovers.
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {sortedMessages.map((chatMessage) => (
          <div key={chatMessage.id} className="rounded-2xl border border-border/70 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                  senderClasses[chatMessage.sender]
                }`}
              >
                {chatMessage.sender}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(chatMessage.timestamp)}
              </span>
            </div>
            <p className="text-sm text-foreground">{chatMessage.message}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        <Input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type a message for the visitor or the next operator..."
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submitMessage();
            }
          }}
        />
        <Button className="gap-2" onClick={submitMessage}>
          <SendHorizonal className="h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
