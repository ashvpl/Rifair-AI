"use client";

import { useEffect, useRef } from "react";

// #region agent log
function debugLog(
  location: string,
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string
) {
  const payload = {
    sessionId: "33be9b",
    location,
    message,
    data,
    hypothesisId,
    timestamp: Date.now(),
    runId: (data.runId as string) ?? "post-fix",
  };
  fetch("/api/debug-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
  fetch("http://127.0.0.1:7444/ingest/72af6889-1483-49f9-99fc-c3a8701a3216", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "33be9b",
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
// #endregion

export function DebugPerfLogger({ page = "unknown" }: { page?: string }) {
  const loggedNav = useRef(false);

  useEffect(() => {
    const mountMs = Math.round(performance.now());

    // #region agent log
    debugLog(
      "perf-logger.tsx:mount",
      "Client component mounted",
      { page, mountMs },
      "A"
    );
    // #endregion

    const logNavAndResources = () => {
      if (loggedNav.current) return;
      loggedNav.current = true;

      const nav = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming | undefined;

      if (nav) {
        // #region agent log
        debugLog(
          "perf-logger.tsx:navigation",
          "Navigation timing",
          {
            page,
            ttfbMs: Math.round(nav.responseStart - nav.requestStart),
            domContentLoadedMs: Math.round(
              nav.domContentLoadedEventEnd - nav.startTime
            ),
            loadEventMs: Math.round(nav.loadEventEnd - nav.startTime),
            domInteractiveMs: Math.round(nav.domInteractive - nav.startTime),
            transferSize: nav.transferSize,
          },
          "D"
        );
        // #endregion
      }

      const paint = performance.getEntriesByType("paint");
      const fcp = paint.find((p) => p.name === "first-contentful-paint");
      if (fcp) {
        // #region agent log
        debugLog(
          "perf-logger.tsx:paint",
          "First contentful paint",
          { page, fcpMs: Math.round(fcp.startTime) },
          "A"
        );
        // #endregion
      }

      const resources = performance.getEntriesByType("resource");
      const host = window.location.host;
      const slow = resources
        .filter((r) => r.duration > 300)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 8)
        .map((r) => ({
          name: r.name.slice(0, 100),
          durationMs: Math.round(r.duration),
        }));

      // #region agent log
      debugLog(
        "perf-logger.tsx:resources",
        "Resource waterfall summary",
        {
          page,
          totalResources: resources.length,
          externalCount: resources.filter(
            (r) => r.name.startsWith("http") && !r.name.includes(host)
          ).length,
          clerkResourceCount: resources.filter((r) =>
            r.name.includes("clerk")
          ).length,
          gaResourceCount: resources.filter((r) =>
            r.name.includes("google")
          ).length,
          slowResources: slow,
        },
        "C"
      );
      // #endregion
    };

    if (document.readyState === "complete") {
      logNavAndResources();
    } else {
      window.addEventListener("load", logNavAndResources, { once: true });
    }

    return () => window.removeEventListener("load", logNavAndResources);
  }, [page]);

  return null;
}
