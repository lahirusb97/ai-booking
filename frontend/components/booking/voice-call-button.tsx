"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Phone, PhoneOff } from "lucide-react";
import { Room, RoomEvent, Track } from "livekit-client";
import { Button } from "@/components/ui/button";
import { getVoiceToken } from "@/lib/voice";

type CallState = "idle" | "connecting" | "in-call" | "ended" | "error";

export function VoiceCallButton() {
  const [state, setState] = useState<CallState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const roomRef = useRef<Room | null>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

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

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={audioContainerRef} className="hidden" />

      {state === "in-call" ? (
        <Button size="lg" variant="destructive" onClick={endCall}>
          <PhoneOff className="size-5" />
          End call
          <span className="ml-1 inline-block size-2 animate-pulse rounded-full bg-current" />
        </Button>
      ) : (
        <Button
          size="lg"
          onClick={startCall}
          disabled={state === "connecting"}
        >
          {state === "connecting" ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Phone className="size-5" />
          )}
          {state === "connecting" ? "Connecting…" : "Call to book"}
        </Button>
      )}

      {state === "ended" && (
        <p className="text-sm text-muted-foreground">Call ended.</p>
      )}

      {state === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
