import { describe, test, expect, vi } from "vitest";
import { createResource } from "../../gui/reactivity/resource.js";
import { signal } from "../../gui/reactivity/signal.js";
import { effect } from "../../gui/reactivity/effect.js";

describe("createResource()", () => {
  test("fetches data and updates reactive state", async () => {
    const fetcher = vi.fn().mockResolvedValue("data");
    const res = createResource(fetcher);

    // Initial state
    expect(res.loading).toBe(true);
    expect(res.value).toBeUndefined();
    expect(res.error).toBeUndefined();

    // Wait for promise resolution
    await new Promise(r => setTimeout(r, 10));

    expect(fetcher).toHaveBeenCalled();
    expect(res.loading).toBe(false);
    expect(res.value).toBe("data");
  });

  test("reacts to source signal changes", async () => {
    const fetcher = vi.fn().mockImplementation(async (id) => `data:${id}`);
    const idList = signal(1);
    const res = createResource(idList, fetcher);

    // Give it a tick to resolve the first fetch
    await new Promise(r => setTimeout(r, 10));
    
    expect(fetcher).toHaveBeenCalledWith(1);
    expect(res.value).toBe("data:1");

    // Change source
    idList.value = 2;
    
    // Check loading after microtask (when effect runs)
    await Promise.resolve();
    expect(res.loading).toBe(true);
    
    await new Promise(r => setTimeout(r, 10));
    
    expect(fetcher).toHaveBeenCalledWith(2);
    expect(res.value).toBe("data:2");
    expect(res.loading).toBe(false);
  });

  test("manual refetch re-runs fetcher", async () => {
    let callCount = 0;
    const fetcher = vi.fn().mockImplementation(async () => {
      callCount++;
      return `run:${callCount}`;
    });

    const res = createResource(fetcher);

    await new Promise(r => setTimeout(r, 10));
    expect(res.value).toBe("run:1");

    res.refetch();
    
    expect(res.loading).toBe(true);
    await new Promise(r => setTimeout(r, 10));
    expect(res.value).toBe("run:2");
  });

  test("handles errors gracefully", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("failed"));
    const res = createResource(fetcher);

    await new Promise(r => setTimeout(r, 10));
    
    expect(res.loading).toBe(false);
    expect(res.value).toBeUndefined();
    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.message).toBe("failed");
  });
});
