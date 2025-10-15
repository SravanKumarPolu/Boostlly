"use client";

import Link from "next/link";
import Image from "next/image";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse duration-3s"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse duration-4s delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse duration-5s delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-10">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur-lg opacity-75"></div>
              <Image
                src="/boostlly-logo.png"
                alt="Boostlly Logo"
                width={32}
                height={32}
                className="relative rounded-xl"
              />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Boostlly Help
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            How notifications and daily scheduling work
          </p>
        </header>

        <div className="max-w-2xl mx-auto space-y-6">
          <section className="p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Notifications
            </h2>
            <p className="text-muted-foreground text-sm">
              Boostlly can send you browser notifications with your daily quote.
              Enable notifications and pick a time in
              <Link href="/settings" className="underline ml-1">
                Settings
              </Link>
              .
            </p>
          </section>

          <section className="p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Daily Schedule
            </h2>
            <p className="text-muted-foreground text-sm">
              We schedule a recurring daily alarm at your chosen time. When the
              alarm fires, the app shows a notification with a reminder to read
              your quote. You can change the time any moment in Settings; the
              schedule updates automatically.
            </p>
          </section>

          <section className="p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Troubleshooting
            </h2>
            <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
              <li>
                Ensure site notifications are allowed in your browser
                permissions.
              </li>
              <li>
                Keep at least one Boostlly tab occasionally open so alarms can
                run reliably.
              </li>
              <li>
                Use the &ldquo;Send Test Notification&rdquo; button in Settings
                to verify permissions.
              </li>
            </ul>
          </section>

          <div className="text-center">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
