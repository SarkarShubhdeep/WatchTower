import Image from "next/image";
import Link from "next/link";
import {
    Shield,
    Database,
    LayoutDashboard,
    GitBranch,
    ArrowRight,
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
                                Data is stored in a local SQLite file.
                                Nothing leaves your device.
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
                                Next.js 16, SQLite, Bun. Runs on port 5800;
                                no Docker required for the database.
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
            </main>
        </div>
    );
}
