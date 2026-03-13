import Image from "next/image";
import Link from "next/link";
import {
    Shield,
    Database,
    LayoutDashboard,
    GitBranch,
    ArrowRight,
    ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <main className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
                {/* Header: logo + title + tagline */}
                <header className="mb-12">
                    <div className="flex items-start gap-4">
                        <Image
                            src="/assets/WatchTower-logo-cropped.svg"
                            alt="WatchTower"
                            width={36}
                            height={64}
                            className="shrink-0"
                            priority
                        />
                        <div>
                            <h1
                                className="text-4xl font-medium tracking-tight text-foreground"
                                style={{
                                    fontFamily:
                                        "var(--font-geist-pixel-square), monospace",
                                }}
                            >
                                WatchTower
                            </h1>
                            <p className="mt-1 text-base text-muted-foreground">
                                Privacy-first, local app tracking tool.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Description */}
                <section className="mb-12">
                    <p className="max-w-xl text-muted-foreground leading-relaxed">
                        WatchTower tracks what&apos;s happening on your
                        computer—active apps, window titles, optional browser
                        tabs, AFK—and stores everything locally. No cloud, no
                        telemetry. All data stays on your machine.
                    </p>
                </section>

                {/* Features */}
                <section className="mb-12">
                    <h2 className="mb-4 text-lg font-semibold text-foreground">
                        Features
                    </h2>
                    <div className="grid sm:grid-cols-2">
                        <Card className="shadow-none rounded-none border flex flex-col justify-between">
                            <CardHeader className="pb-2">
                                <Shield className="mb-1 size-5 text-muted-foreground" />
                                <CardTitle className="text-base">
                                    Local-only
                                </CardTitle>
                            </CardHeader>
                            <CardDescription className="px-6">
                                Data is stored in a local SQLite file. Nothing
                                leaves your device.
                            </CardDescription>
                        </Card>
                        <Card className="shadow-none rounded-none border-y border-r border-l-0 flex flex-col justify-between">
                            <CardHeader className="pb-2">
                                <LayoutDashboard className="mb-1 size-5 text-muted-foreground" />
                                <CardTitle className="text-base">
                                    Simple list & stats
                                </CardTitle>
                            </CardHeader>
                            <CardDescription className="px-6">
                                View activity as a list with basic filtering and
                                simple time summaries (e.g. &quot;Cursor 3h
                                today&quot;).
                            </CardDescription>
                        </Card>

                        <Card className="shadow-none rounded-none border-l border-r border-t-0 flex flex-col justify-between">
                            <CardHeader className="pb-2">
                                <Database className="mb-1 size-5 text-muted-foreground" />
                                <CardTitle className="text-base">
                                    Tech stack
                                </CardTitle>
                            </CardHeader>
                            <CardDescription className="px-6">
                                Next.js 16, SQLite, Bun. Runs on port 5800; no
                                Docker required for the database.
                            </CardDescription>
                        </Card>
                        <Card className="shadow-none rounded-none border-l-0 border-r border-t-0 flex flex-col justify-between">
                            <CardHeader className="pb-2">
                                <GitBranch className="mb-1 size-5 text-muted-foreground" />
                                <CardTitle className="text-base">
                                    How it works
                                </CardTitle>
                            </CardHeader>
                            <CardDescription className="px-6">
                                TBD — tracking collectors (desktop + browser)
                                and API design coming next.
                            </CardDescription>
                        </Card>
                    </div>
                </section>

                {/* Links */}
                <section className="flex flex-wrap gap-3">
                    <Button
                        asChild
                        size="lg"
                        className="rounded-none shadow-none"
                    >
                        <Link href="/api/health">
                            API health
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full shadow-none"
                    >
                        <Link href="/activity" target="_blank">
                            View Tracking
                            <ArrowUpRight className="size-4" />
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="rounded-none shadow-none"
                    >
                        <a
                            href="https://github.com/SarkarShubhdeep/WatchTower"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                    </Button>
                </section>

                {/* Getting started */}
                <section className="mt-16 space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            Run WatchTower on your machine
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                            Get a local WatchTower instance running in a few
                            minutes so you can see activity from your own
                            machine.
                        </p>
                    </div>

                    <div className="space-y-4 text-sm">
                        <div>
                            <h3 className="font-medium text-foreground">
                                Requirements
                            </h3>
                            <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                                <li>Bun or Node.js LTS installed</li>
                                <li>macOS (for the current watchers)</li>
                                <li>No Docker required</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-medium text-foreground">
                                Setup &amp; run
                            </h3>
                            <ol className="mt-1 list-decimal space-y-1 pl-5 text-muted-foreground">
                                <li>
                                    Clone the repo:&nbsp;
                                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                        git clone
                                        https://github.com/SarkarShubhdeep/WatchTower.git
                                    </code>
                                </li>
                                <li>
                                    Change into the app folder:&nbsp;
                                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                        cd WatchTower/app
                                    </code>
                                </li>
                                <li>
                                    Install dependencies:&nbsp;
                                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                        bun install
                                    </code>{" "}
                                    (or{" "}
                                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                        npm install
                                    </code>
                                    )
                                </li>
                                <li>
                                    Start the dev server:&nbsp;
                                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                        bun run dev
                                    </code>{" "}
                                    (or{" "}
                                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                        npm run dev
                                    </code>
                                    )
                                </li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-medium text-foreground">
                                Open the app
                            </h3>
                            <p className="mt-1 text-muted-foreground">
                                Once the server is running, open{" "}
                                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                    http://localhost:5800
                                </code>{" "}
                                in your browser. The{" "}
                                <span className="font-medium">
                                    Activity
                                </span>{" "}
                                page will start showing live events as soon as
                                the watchers are running.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-medium text-foreground">
                                Check that the backend is healthy
                            </h3>
                            <p className="mt-1 text-muted-foreground">
                                Visit{" "}
                                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                    http://localhost:5800/api/health
                                </code>
                                . If everything is wired up, you&apos;ll see{" "}
                                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                    {"{\"ok\":true}"}
                                </code>
                                , and the SQLite database file will be created
                                automatically on first run.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-medium text-foreground">
                                Troubleshooting
                            </h3>
                            <p className="mt-1 text-muted-foreground">
                                If you hit a SQLite &quot;bindings&quot; error,
                                run{" "}
                                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                    npm rebuild better-sqlite3
                                </code>{" "}
                                inside the{" "}
                                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                    app
                                </code>{" "}
                                folder and restart the dev server.
                            </p>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            For more details on collectors, configuration, and
                            future integrations, see the full README on{" "}
                            <a
                                href="https://github.com/SarkarShubhdeep/WatchTower"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-2"
                            >
                                GitHub
                            </a>
                            .
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
