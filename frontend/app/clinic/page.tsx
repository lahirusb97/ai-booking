import Link from "next/link";
import { IconArrowLeft, IconStethoscope } from "@tabler/icons-react";

export default function ClinicPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center sm:px-8">
      <IconStethoscope className="size-12 text-primary" />
      <div className="flex flex-col gap-2">
        <h1>Clinic Appointment AI is coming soon</h1>
        <p className="max-w-md text-muted-foreground">
          We&apos;re building an AI voice assistant that books, reschedules,
          and confirms patient appointments over the phone. Check back soon.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <IconArrowLeft className="size-4" />
        Back to home
      </Link>
    </div>
  );
}
