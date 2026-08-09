"use client";

import { CalendarClock } from "lucide-react";
import { PublicSlotBrowser } from "@/components/booking/public-slot-browser";
import { VoiceCallButton } from "@/components/booking/voice-call-button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card">
        <div className="flex h-16 w-full items-center px-4 sm:px-8">
          <div className="flex items-center gap-2 font-semibold">
            <CalendarClock className="size-5 text-primary" />
            <span>TableTime</span>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-secondary/30 px-4 py-8 sm:px-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl">Reserve your table</h1>
            <p className="mt-2 text-muted-foreground">
              Book online below, or talk to our AI booking assistant.
            </p>
            <div className="mt-6">
              <VoiceCallButton />
            </div>
          </div>

          <PublicSlotBrowser />
        </div>
      </main>
    </div>
  );
}
