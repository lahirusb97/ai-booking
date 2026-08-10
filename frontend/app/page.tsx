"use client";

import Image from "next/image";
import { IconClock, IconMapPin, IconSparkles, IconToolsKitchen2 } from "@tabler/icons-react";
import { PublicSlotBrowser } from "@/components/booking/public-slot-browser";
import { VoiceCallButton } from "@/components/booking/voice-call-button";

const highlights = [
  {
    icon: IconToolsKitchen2,
    title: "Seasonal menu",
    description: "Fresh, locally-sourced dishes crafted daily by our kitchen team.",
  },
  {
    icon: IconClock,
    title: "Open every day",
    description: "Lunch and dinner service, seven days a week.",
  },
  {
    icon: IconMapPin,
    title: "In the heart of town",
    description: "Easy to find, with seating for every occasion.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1">
        <section className="relative isolate flex min-h-[36rem] items-center overflow-hidden sm:min-h-[44rem]">
          <Image
            src="/landing.webp"
            alt="Warm, softly-lit dining room with a full bar"
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/45 to-black/20" />

          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm ring-1 ring-white/20">
              <IconSparkles className="size-3.5" />
              Now taking reservations
            </span>
            <h1 className="text-white drop-shadow-md">
              A table, whenever you&apos;re hungry
            </h1>
            <p className="max-w-xl text-lg text-white/85 drop-shadow-sm">
              Book online in seconds, or just call and let our AI host find you
              the perfect time.
            </p>
            <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
              <a
                href="#book"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-black/30 transition-colors hover:bg-primary/90"
              >
                Book a table
              </a>
              <VoiceCallButton />
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-8">
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-6 text-center"
              >
                <Icon className="size-6 text-primary" />
                <h3 className="text-base">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="book" className="scroll-mt-8 bg-secondary/30 px-4 py-12 sm:px-8">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
            <div className="text-center">
              <h2>Reserve your table</h2>
              <p className="mt-2 text-muted-foreground">
                Pick a date and time below, or talk to our AI booking assistant.
              </p>
            </div>

            <PublicSlotBrowser />
          </div>
        </section>
      </main>
    </div>
  );
}
