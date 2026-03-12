"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type EventRow = {
    id: number;
    source: string;
    app: string;
    window_title: string | null;
    start_ts: number;
    end_ts: number;
    duration: number;
    category: string | null;
};

type StatsRow = {
    app: string;
    window_title: string | null;
    duration_seconds: number;
};

function formatTime(ts: number): string {
    const d = new Date(ts * 1000);
    return d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return "00:00:00";
    const total = Math.floor(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function ActivityPage() {
    const [date, setDate] = useState<string>(() => todayIso());
    const [events, setEvents] = useState<EventRow[]>([]);
    const [stats, setStats] = useState<StatsRow[]>([]);
    const [appFilter, setAppFilter] = useState<string>("all");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (selectedDate: string) => {
        try {
            console.info(
                "[activity] fetching events/stats for date",
                selectedDate,
            );
            setError(null);
            const [eventsRes, statsRes] = await Promise.all([
                fetch(`/api/events?date=${encodeURIComponent(selectedDate)}`),
                fetch(`/api/stats?date=${encodeURIComponent(selectedDate)}`),
            ]);

            if (!eventsRes.ok) {
                throw new Error(`Events request failed (${eventsRes.status})`);
            }
            if (!statsRes.ok) {
                throw new Error(`Stats request failed (${statsRes.status})`);
            }

            const eventsJson = (await eventsRes.json()) as {
                events?: EventRow[];
            };
            const statsJson = (await statsRes.json()) as { stats?: StatsRow[] };

            const nextEvents = eventsJson.events ?? [];
            const nextStats = statsJson.stats ?? [];

            console.debug(
                "[activity] received",
                nextEvents.length,
                "events and",
                nextStats.length,
                "stats rows",
            );

            setEvents(nextEvents);
            setStats(nextStats);
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Failed to load activity",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        let cancelled = false;

        const initial = async () => {
            await loadData(date);
            if (cancelled) return;
        };

        void initial();

        const interval = setInterval(() => {
            void loadData(date);
        }, 5000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [date]);

    const apps = useMemo(
        () =>
            Array.from(new Set(events.map((e) => e.app))).sort((a, b) =>
                a.localeCompare(b),
            ),
        [events],
    );

    const visibleEvents = useMemo(
        () =>
            appFilter === "all"
                ? events
                : events.filter((e) => e.app === appFilter),
        [events, appFilter],
    );

    const orderedEvents = useMemo(
        () => [...visibleEvents].sort((a, b) => b.start_ts - a.start_ts),
        [visibleEvents],
    );

    const hasAfk = events.some(
        (e) => e.source === "afk" || e.category === "afk",
    );

    return (
        <div className="min-h-screen bg-background">
            <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8 sm:px-8 sm:py-12">
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Activity className="h-4 w-4" aria-hidden />
                            <span>Live activity feed</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                            Activity today
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                            Flat, local-only view of what the watchers are
                            recording while WatchTower is running. Updates every
                            few seconds.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                        >
                            <Link href="/">
                                <ArrowLeft className="mr-1 h-3 w-3" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]" />
                            <span>Live</span>
                        </div>
                    </div>
                </header>

                <section className="mb-6 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <label
                            htmlFor="activity-date"
                            className="text-muted-foreground"
                        >
                            Date
                        </label>
                        <input
                            id="activity-date"
                            type="date"
                            className="rounded-none border bg-background px-3 py-1.5 text-sm text-foreground shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <label
                            htmlFor="activity-app"
                            className="text-muted-foreground"
                        >
                            App
                        </label>
                        <select
                            id="activity-app"
                            className="rounded-none border bg-background px-3 py-1.5 text-sm text-foreground shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={appFilter}
                            onChange={(e) => setAppFilter(e.target.value)}
                        >
                            <option value="all">All apps</option>
                            {apps.map((app) => (
                                <option key={app} value={app}>
                                    {app}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={() => {
                            setLoading(true);
                            void loadData(date);
                        }}
                        aria-label="Refresh activity"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </section>

                <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-stretch">
                    <Card className="shadow-none rounded-none border flex flex-col h-full gap-0 py-0">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 py-6">
                            <div>
                                <CardTitle className="text-base">
                                    Activity list
                                </CardTitle>
                                <CardDescription>
                                    One row per context switch or AFK segment.
                                </CardDescription>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {loading
                                    ? "Loading…"
                                    : `${visibleEvents.length} events`}
                            </span>
                        </CardHeader>
                        <div className="border-t px-4 py-3 text-xs text-muted-foreground flex items-center justify-between">
                            <span>
                                Showing{" "}
                                <span className="font-medium text-foreground">
                                    {date}
                                </span>
                                {appFilter !== "all" && (
                                    <>
                                        {" \u2022 "}
                                        <span className="font-medium text-foreground">
                                            {appFilter}
                                        </span>
                                    </>
                                )}
                            </span>
                            {hasAfk && <span>Includes AFK segments</span>}
                        </div>
                        <ScrollArea
                            className="flex-1"
                            style={{
                                maxHeight: "calc(100vh - 600px)",
                                height: "100%",
                            }}
                        >
                            <div className="divide-y text-sm flex flex-col">
                                {error && (
                                    <div className="px-4 py-3 text-xs text-red-600">
                                        {error}
                                    </div>
                                )}
                                {!error &&
                                    orderedEvents.length === 0 &&
                                    !loading && (
                                        <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                                            No activity recorded for this date
                                            yet. Make sure the watchers are
                                            running.
                                        </div>
                                    )}
                                {orderedEvents.map((event) => {
                                    const isAfk =
                                        event.source === "afk" ||
                                        event.category === "afk";
                                    return (
                                        <div
                                            key={event.id}
                                            className="activity-row w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/40 transition-colors"
                                        >
                                            <div className="mt-0.5 w-20 shrink-0 text-xs text-muted-foreground">
                                                <div>
                                                    {formatTime(event.start_ts)}
                                                </div>
                                                <div>
                                                    {formatTime(event.end_ts)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="truncate text-sm font-medium text-foreground">
                                                        {event.app}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatDuration(
                                                            event.duration,
                                                        )}
                                                    </div>
                                                </div>
                                                {event.window_title && (
                                                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                                                        {event.window_title}
                                                    </div>
                                                )}
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                                    <span className="rounded-full border px-2 py-0.5 uppercase tracking-wide">
                                                        {event.source}
                                                    </span>
                                                    {isAfk && (
                                                        <span className="rounded-full border border-amber-400/70 bg-amber-50 px-2 py-0.5 text-amber-700">
                                                            AFK
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </Card>

                    <Card className="shadow-none rounded-none border flex flex-col">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                                Today&apos;s summary
                            </CardTitle>
                            <CardDescription>
                                Simple totals by app and window for the selected
                                date.
                            </CardDescription>
                        </CardHeader>
                        <div className="border-t divide-y text-sm">
                            {stats.length === 0 && !loading && (
                                <div className="px-4 py-6 text-xs text-muted-foreground">
                                    No statistics yet for this date.
                                </div>
                            )}
                            {stats.map((row) => (
                                <div
                                    key={`${row.app}-${row.window_title ?? ""}`}
                                    className="px-4 py-3 flex items-start justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-foreground truncate">
                                            {row.app}
                                        </div>
                                        {row.window_title && (
                                            <div className="mt-0.5 text-xs text-muted-foreground truncate">
                                                {row.window_title}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground shrink-0">
                                        {formatDuration(row.duration_seconds)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
