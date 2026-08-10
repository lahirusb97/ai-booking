import Image from "next/image";
import {
  IconCalendarCheck,
  IconCalendarPlus,
  IconCalendarX,
  IconLanguage,
  IconPhoneCall,
  IconSparkles,
} from "@tabler/icons-react";
import { VoiceCallButton } from "@/components/booking/voice-call-button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const capabilities = [
  {
    icon: IconCalendarCheck,
    title: "Checks availability",
    description: "Looks up real open tables before offering a time.",
  },
  {
    icon: IconLanguage,
    title: "Any language",
    description: "Takes guest calls in whatever language they speak.",
  },
  {
    icon: IconCalendarPlus,
    title: "Makes reservations",
    description: "Books the table and confirms it on the call.",
  },
  {
    icon: IconCalendarX,
    title: "Cancels reservations",
    description: "Finds the booking by phone number and cancels it.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-8 sm:pt-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,theme(colors.primary/12%),transparent)]"
          />

          <div className="mx-auto w-full max-w-5xl">
            <div className="flex flex-col-reverse items-center gap-6 sm:mt-8 lg:flex-row lg:items-center lg:gap-4">
              <div className="flex flex-col items-center gap-4 text-center lg:w-[44%] lg:items-start lg:text-left">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                  <IconSparkles className="size-3.5" />
                  Live product demo
                </span>
                <h1>Meet Ava, your Restaurant Reservation AI</h1>
                <p className="max-w-md text-lg text-muted-foreground">
                  Call now and book a table in seconds.
                </p>

                <VoiceCallButton className="mt-2 h-14 gap-2.5 rounded-2xl px-8 text-lg [&_svg]:size-6" />
              </div>

              <div className="relative flex h-80 w-72 shrink-0 items-end justify-center sm:h-96 sm:w-80 lg:h-[28rem] lg:w-96">
                <span
                  aria-hidden
                  className="absolute bottom-0 h-64 w-64 rounded-full bg-primary/10 blur-2xl sm:h-72 sm:w-72"
                />
                <div className="relative h-full w-full animate-float">
                  <Image
                    src="/ava-full.png"
                    alt="Ava, the AI receptionist"
                    fill
                    sizes="(min-width: 1024px) 384px, 320px"
                    className="origin-bottom scale-150 object-contain object-bottom drop-shadow-xl"
                    priority
                  />
                </div>
                <span className="absolute bottom-6 right-8 flex size-10 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-background sm:right-10">
                  <IconPhoneCall className="size-4.5 text-white" />
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-8">
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="ring-1 ring-border">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="mt-3 text-base">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="mx-auto mt-10 flex w-full max-w-4xl items-center justify-center gap-2 text-sm text-muted-foreground">
            <IconPhoneCall className="size-4" />
            Try asking for a table for two tomorrow evening.
          </div>
        </section>
      </main>
    </div>
  );
}
