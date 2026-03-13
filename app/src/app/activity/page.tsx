"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <div className="max-h-screen bg-background ">
            <main className="mx-auto flex max-h-screen max-w-6xl flex-col py-6 sm:px-8 sm:py-12">
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="uppercase">
                                WatchTower: Live activity feed
                            </span>
                        </div>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                            Activity today
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                            Live activity feed for your current session.
                            Whenever you switch apps, open windows, or go AFK,
                            the watchers record it here and this view refreshes
                            every few seconds.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 p-2 rounded-full px-3 bg-emerald-50">
                            <span className="text-primary">Status:</span>
                            <span className="uppercase font-medium">Live</span>
                            <span className="animate-pulse inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]" />
                        </div>
                    </div>
                </header>

                <section className="mb-4 flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2 text-sm">
                        <label
                            htmlFor="activity-date"
                            className="text-muted-foreground text-xs"
                        >
                            Date
                        </label>
                        <input
                            id="activity-date"
                            type="date"
                            className="rounded-lg border bg-background px-3 py-1.5 text-sm text-foreground shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">App</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg px-3 py-1.5  font-normal w-32 justify-between shadow-none"
                                    aria-label="Filter activity by application"
                                >
                                    <span className="truncate max-w-[140px]">
                                        {appFilter === "all"
                                            ? "All apps"
                                            : appFilter}
                                    </span>
                                    <ChevronDown className="size-3 opacity-70" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                    onSelect={() => setAppFilter("all")}
                                >
                                    All apps
                                </DropdownMenuItem>
                                {apps.map((app) => (
                                    <DropdownMenuItem
                                        key={app}
                                        onSelect={() => setAppFilter(app)}
                                    >
                                        {app}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="rounded-full shadow-none"
                        onClick={() => {
                            setLoading(true);
                            void loadData(date);
                        }}
                        aria-label="Refresh activity"
                    >
                        <RefreshCw className="size-3" />
                    </Button>
                </section>

                <div className="flex flex-1 flex-col gap-4 lg:flex-row min-h-0">
                    {/* Activity list section */}
                    <Card className="shadow-none rounded-none border flex flex-col flex-1 min-h-0 gap-0 py-0">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 py-6">
                            <div>
                                <CardTitle className="text-base">
                                    Activity list
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                    One row per context switch or AFK segment.
                                </CardDescription>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {loading
                                    ? "Loading…"
                                    : `${visibleEvents.length} events`}
                            </span>
                        </CardHeader>
                        <div className="border-b px-4 pb-3 text-xs text-muted-foreground flex items-center justify-between">
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
                        <ScrollArea className="flex-1">
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
                                            className="activity-row w-full px-4 py-3 flex items-start hover:bg-muted/40 transition-colors"
                                        >
                                            <div className="mt-0.5 w-20 shrink-0 text-xs text-muted-foreground ">
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

                    {/* Summary section */}
                    <Card className="shadow-none rounded-none border flex flex-col flex-1 min-h-0 p-0 gap-0">
                        <div className="px-4 py-6">
                            <CardTitle className="text-base">
                                Today&apos;s summary
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Simple totals by app and window for the selected
                                date.
                            </CardDescription>
                        </div>
                        <div className="border-t divide-y text-sm flex-1 min-h-0 flex flex-col">
                            <ScrollArea className="flex-1">
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
                                            {formatDuration(
                                                row.duration_seconds,
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </ScrollArea>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
