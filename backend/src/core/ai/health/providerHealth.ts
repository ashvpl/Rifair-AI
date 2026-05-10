

// ─── Provider Health Record ───────────────────────────────────────────────────

export interface ProviderHealth {
  name: string;
  successCount: number;
  failureCount: number;
  timeoutCount: number;
  rateLimitCount: number;
  totalLatencyMs: number;
  requestCount: number;
  isBlocked: boolean;
  blockedUntil: number;
}

// ─── Health Tracker ───────────────────────────────────────────────────────────

/**
 * In-memory provider health tracker.
 * Tracks per-provider metrics for observability and circuit-breaking decisions.
 * All operations are synchronous — no external dependencies.
 */
class ProviderHealthTracker {
  private readonly store = new Map<string, ProviderHealth>();

  private init(name: string): ProviderHealth {
    if (!this.store.has(name)) {
      this.store.set(name, {
        name,
        successCount: 0,
        failureCount: 0,
        timeoutCount: 0,
        rateLimitCount: 0,
        totalLatencyMs: 0,
        requestCount: 0,
        isBlocked: false,
        blockedUntil: 0,
      });
    }
    return this.store.get(name)!;
  }

  recordSuccess(name: string, latencyMs: number): void {
    const h = this.init(name);
    h.successCount++;
    h.requestCount++;
    h.totalLatencyMs += latencyMs;
    // Auto-unblock on success
    if (h.isBlocked && Date.now() > h.blockedUntil) {
      h.isBlocked = false;
      h.blockedUntil = 0;
    }
  }

  recordFailure(name: string): void {
    const h = this.init(name);
    h.failureCount++;
    h.requestCount++;
  }

  recordTimeout(name: string): void {
    const h = this.init(name);
    h.timeoutCount++;
    h.requestCount++;
  }

  recordRateLimit(name: string): void {
    const h = this.init(name);
    h.rateLimitCount++;
    h.requestCount++;
  }

  block(name: string, durationMs: number): void {
    const h = this.init(name);
    h.isBlocked = true;
    h.blockedUntil = Date.now() + durationMs;
  }

  isBlocked(name: string): boolean {
    const h = this.store.get(name);
    if (!h) return false;
    if (h.isBlocked && Date.now() > h.blockedUntil) {
      h.isBlocked = false;
      h.blockedUntil = 0;
    }
    return h.isBlocked;
  }

  getAverageLatency(name: string): number {
    const h = this.store.get(name);
    if (!h || h.successCount === 0) return 0;
    return Math.round(h.totalLatencyMs / h.successCount);
  }

  getAll(): ProviderHealth[] {
    return Array.from(this.store.values());
  }

  getSummary(): Record<string, object> {
    const out: Record<string, object> = {};
    this.store.forEach((h, name) => {
      out[name] = {
        success: h.successCount,
        failures: h.failureCount,
        timeouts: h.timeoutCount,
        rateLimits: h.rateLimitCount,
        avgLatencyMs: this.getAverageLatency(name),
        blocked: h.isBlocked,
      };
    });
    return out;
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

export const providerHealth = new ProviderHealthTracker();
