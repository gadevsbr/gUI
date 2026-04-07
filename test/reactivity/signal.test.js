import { describe, it, expect, vi } from "vitest";
import { signal } from "../../gui/reactivity/signal.js";
import { effect } from "../../gui/reactivity/effect.js";

describe("signal()", () => {
  it("retorna o valor inicial", () => {
    const s = signal(42);
    expect(s.value).toBe(42);
  });

  it("atualiza o valor via .value setter", () => {
    const s = signal(0);
    s.value = 99;
    expect(s.value).toBe(99);
  });

  it(".set() atualiza e retorna o novo valor", () => {
    const s = signal("a");
    const result = s.set("b");
    expect(result).toBe("b");
    expect(s.value).toBe("b");
  });

  it(".update() aplica transformação e retorna o novo valor", () => {
    const s = signal(10);
    const result = s.update((v) => v * 2);
    expect(result).toBe(20);
    expect(s.value).toBe(20);
  });

  it(".peek() retorna o valor atual sem rastrear dependência", async () => {
    const s = signal(1);
    const spy = vi.fn();

    effect(() => {
      s.peek(); // não deve criar dependência
      spy();
    });

    expect(spy).toHaveBeenCalledTimes(1);

    s.value = 2;
    await Promise.resolve();

    // spy não deve ter sido chamado de novo
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("não notifica subscribers quando o valor não muda (Object.is)", async () => {
    const s = signal(5);
    const spy = vi.fn();

    effect(() => {
      s.value;
      spy();
    });

    expect(spy).toHaveBeenCalledTimes(1);

    s.value = 5; // mesmo valor
    await Promise.resolve();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("notifica subscribers quando o valor muda", async () => {
    const s = signal(1);
    const calls = [];

    effect(() => {
      calls.push(s.value);
    });

    s.value = 2;
    await Promise.resolve();

    expect(calls).toEqual([1, 2]);
  });

  it(".inspect() retorna snapshot do nó interno", () => {
    const s = signal(7, { label: "meu-signal" });
    const info = s.inspect();
    expect(info.kind).toBe("signal");
    expect(info.label).toBe("meu-signal");
    expect(info.version).toBe(0);
  });

  it("suporta valores null e undefined", () => {
    const s1 = signal(null);
    const s2 = signal(undefined);
    expect(s1.value).toBeNull();
    expect(s2.value).toBeUndefined();
  });

  it("suporta objetos como valor", () => {
    const obj = { x: 1 };
    const s = signal(obj);
    expect(s.value).toBe(obj);
  });

  it("expõe __node não-enumerável", () => {
    const s = signal(0);
    expect(s.__node).toBeDefined();
    expect(Object.keys(s).includes("__node")).toBe(false);
  });
});
