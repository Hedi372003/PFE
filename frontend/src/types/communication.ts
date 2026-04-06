export type CallMode = "audio" | "video";
export type CallState = "idle" | "connecting" | "live" | "ended" | "error";
export type ChatSender = "system" | "operator" | "visitor";

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  message: string;
  timestamp: string;
}
