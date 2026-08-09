import { apiFetch } from "@/lib/api";

export interface VoiceTokenResponse {
  token: string;
  url: string;
  roomName: string;
}

export function getVoiceToken(): Promise<VoiceTokenResponse> {
  return apiFetch<VoiceTokenResponse>("/voice/token", { method: "POST" });
}
