import { describe, it, expect, vi } from "vitest";
import { signal } from "../../gui/reactivity/signal.js";
import { effect } from "../../gui/reactivity/effect.js";

describe("effect()", () => {
  it("executa imediatamente na criação", () => {
    const spy = vi.fn();
    effect(spy);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("re-executa via microtask ao mudar signal rastreado", async () => {
    const s = signal(0);
    const calls = [];

    effect(() => {
      calls.push(s.value);
    });

    s.value = 1;
    await Promise.resolve();

    expect(calls).toEqual([0, 1]);
  });

  it("deduplicação: múltiplas escritas no mesmo tick → um só re-run", async () => {
    const s = signal(0);
    const spy = vi.fn(() => s.value);

    effect(spy);
    expect(spy).toHaveBeenCalledTimes(1);

    s.value = 1;
    s.value = 2;
    s.value = 3;
    await Promise.resolve();

    // apenas 1 re-run, com valor final 3
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("cleanup é chamado antes de cada re-run", async () => {
    const s = signal(0);
    const order = [];

    effect(() => {
      s.value;
      order.push("run");
      return () => order.push("cleanup");
    });

    s.value = 1;
    await Promise.resolve();

    expect(order).toEqual(["run", "cleanup", "run"]);
  });

  it("cleanup é chamado ao fazer dispose", () => {
    const cleanupFn = vi.fn();
    const stop = effect(() => cleanupFn);

    expect(cleanupFn).not.toHaveBeenCalled();
    stop();
    expect(cleanupFn).toHaveBeenCalledTimes(1);
  });

  it("não re-executa após dispose", async () => {
    const s = signal(0);
    const spy = vi.fn(() => s.value);

    const stop = effect(spy);
    expect(spy).toHaveBeenCalledTimes(1);

    stop();
    s.value = 99;
    await Promise.resolve();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("rastreia múltiplos signals e re-executa quando qualquer um muda", async () => {
    const a = signal(1);
    const b = signal(10);
    const results = [];

    effect(() => {
      results.push(a.value + b.value);
    });

    a.value = 2;
    await Promise.resolve();
    b.value = 20;
    await Promise.resolve();

    expect(results).toEqual([11, 12, 22]);
  });

  it("efeitos aninhados: effect interno re-executa independentemente", async () => {
    const outer = signal(0);
    const inner = signal(0);
    const outerCalls = [];
    const innerCalls = [];

    effect(() => {
      outerCalls.push(outer.value);
      effect(() => {
        innerCalls.push(inner.value);
      });
    });

    inner.value = 1;
    await Promise.resolve();

    expect(outerCalls).toEqual([0]);
    expect(innerCalls.length).toBeGreaterThanOrEqual(2);
  });

  it(".inspect() retorna snapshot do nó", () => {
    const stop = effect(() => {}, { label: "meu-effect" });
    const info = stop.inspect();
    expect(info.kind).toBe("effect");
    expect(info.label).toBe("meu-effect");
    stop();
  });

  it("retorna função de dispose", () => {
    const stop = effect(() => {});
    expect(typeof stop).toBe("function");
  });
});
