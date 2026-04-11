import { describe, test, expect, vi } from "vitest";
import { signal } from "../../gui/reactivity/signal.js";
import { effect } from "../../gui/reactivity/effect.js";
import { batch } from "../../gui/core/scheduler.js";

describe("batch()", () => {
  test("combines multiple signal updates into a single effect flush", async () => {
    const a = signal(0);
    const b = signal(0);
    let runs = 0;

    effect(() => {
      a.value;
      b.value;
      runs++;
    });

    // Initial run
    expect(runs).toBe(1);

    // Batch prevents immediate microtask flush and does it synchronously at the end
    batch(() => {
      a.value = 1;
      b.value = 2;
      a.value = 3;
    });

    // Should only run once additionally, right at the end of the batch
    expect(runs).toBe(2);
    expect(a.value).toBe(3);
    expect(b.value).toBe(2);
  });

  test("handles nested batches", () => {
    const s = signal(0);
    let runs = 0;

    effect(() => {
      s.value;
      runs++;
    });

    expect(runs).toBe(1);

    batch(() => {
      s.value = 1;
      
      batch(() => {
        s.value = 2;
      });
      
      // Still hasn't completed top-level batch
      expect(runs).toBe(1);
    });

    expect(runs).toBe(2);
  });

  test("recovers from errors within batch", () => {
    const a = signal(0);
    const b = signal(0);
    let runs = 0;

    effect(() => {
      a.value;
      b.value;
      runs++;
    });

    expect(runs).toBe(1);

    try {
      batch(() => {
        a.value = 1;
        throw new Error("test error");
        b.value = 2;
      });
    } catch {
      // Expected
    }

    // Since it threw, the flush jobs might still be triggered,
    // intercepting the error shouldn't block future jobs.
    // Wait for microtask if it was queued, but we flush on error as well?
    // Wait, if it throws, batchDepth decreases, and flushJobs runs!
    expect(runs).toBe(2);

    // Normal non-batched update should work again
    a.value = 5;
    
    // We have to wait for microtask because it's non-batched
    return Promise.resolve().then(() => {
      expect(runs).toBe(3);
    });
  });
});
