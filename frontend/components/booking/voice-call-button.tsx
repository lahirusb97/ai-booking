"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IconLoader2, IconPhone, IconPhoneOff } from "@tabler/icons-react";
import { Room, RoomEvent, Track } from "livekit-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getVoiceToken } from "@/lib/voice";

type CallState = "idle" | "connecting" | "in-call" | "ended" | "error";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

const statusLabel: Record<CallState, string> = {
  idle: "",
  connecting: "Calling…",
  "in-call": "Connected",
  ended: "Call ended",
  error: "Couldn't connect",
};

export function VoiceCallButton({ className }: { className?: string }) {
  const [state, setState] = useState<CallState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const roomRef = useRef<Room | null>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (state !== "in-call") return;
    setElapsed(0);
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  async function startCall() {
    setErrorMessage(null);
    setState("connecting");

    const room = new Room();

    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Audio) {
        const el = track.attach();
        audioContainerRef.current?.appendChild(el);
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (track) => {
      track.detach().forEach((el) => el.remove());
    });

    room.on(RoomEvent.Disconnected, () => {
      setState("ended");
      roomRef.current = null;
    });

    try {
      const { token, url } = await getVoiceToken();
      await room.connect(url, token);
      await room.localParticipant.setMicrophoneEnabled(true);
      roomRef.current = room;
      setState("in-call");
    } catch (err) {
      room.disconnect();
      roomRef.current = null;
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Couldn't start the call. Please try again.",
      );
      setState("error");
    }
  }

  function endCall() {
    roomRef.current?.disconnect();
    roomRef.current = null;
    setState("ended");
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      roomRef.current?.disconnect();
      roomRef.current = null;
      setState("idle");
    }
  }

  const isOpen = state !== "idle";

  return (
    <>
      <div ref={audioContainerRef} className="hidden" />

      <Button size="lg" onClick={startCall} className={className}>
        <IconPhone className="size-5" />
        Call to book
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className="flex flex-col items-center gap-7 overflow-hidden py-12 text-center sm:max-w-md"
          overlayClassName="bg-black/60"
        >
          <DialogTitle className="sr-only">
            Voice call with the AI receptionist
          </DialogTitle>

          <div className="relative flex size-40 items-center justify-center">
            {state === "connecting" && (
              <>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/25" />
                <span className="absolute inline-flex size-full animate-pulse rounded-full bg-primary/10" />
              </>
            )}
            {state === "in-call" && (
              <span className="absolute inline-flex size-full animate-pulse rounded-full bg-emerald-500/15" />
            )}
            <div
              className={cn(
                "relative size-32 overflow-hidden rounded-full bg-secondary ring-2 ring-background shadow-lg",
                state === "in-call" && "ring-emerald-500/40",
                state === "error" && "ring-destructive/40",
              )}
            >
              <Image
                src="/ava-face.png"
                alt="AI receptionist avatar"
                fill
                sizes="128px"
                className="object-cover object-top scale-110"
                priority
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <p className="font-heading text-xl font-medium">Ava</p>
            <p className="text-base text-muted-foreground">
              AI receptionist
            </p>
          </div>

          <div className="flex h-7 items-center gap-2 text-base text-muted-foreground">
            {state === "connecting" && (
              <>
                <IconLoader2 className="size-5 animate-spin" />
                <span>{statusLabel[state]}</span>
              </>
            )}
            {state === "in-call" && (
              <>
                <span className="size-2.5 rounded-full bg-emerald-500" />
                <span>{statusLabel[state]}</span>
                <span className="tabular-nums">
                  · {formatDuration(elapsed)}
                </span>
              </>
            )}
            {state === "ended" && <span>{statusLabel[state]}</span>}
            {state === "error" && (
              <span role="alert" className="text-destructive">
                {errorMessage ?? statusLabel[state]}
              </span>
            )}
          </div>

          {state === "in-call" ? (
            <Button
              size="lg"
              variant="destructive"
              onClick={endCall}
              className="h-12 gap-2 rounded-xl px-7 text-base [&_svg]:size-5"
            >
              <IconPhoneOff className="size-5" />
              End call
            </Button>
          ) : (
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="h-12 rounded-xl px-7 text-base"
            >
              Close
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
