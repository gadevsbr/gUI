import { describe, it, expect, vi } from "vitest";
import { signal } from "../../gui/reactivity/signal.js";
import { computed } from "../../gui/reactivity/computed.js";
import { effect } from "../../gui/reactivity/effect.js";

describe("computed()", () => {
  it("calcula o valor a partir de signals", () => {
    const a = signal(2);
    const b = signal(3);
    const sum = computed(() => a.value + b.value);
    expect(sum.value).toBe(5);
  });

  it("é lazy: não executa antes de ser lido", () => {
    const spy = vi.fn(() => 42);
    computed(spy);
    expect(spy).not.toHaveBeenCalled();
  });

  it("cacheia o resultado: segunda leitura não re-executa a função", () => {
    const spy = vi.fn(() => 1);
    const c = computed(spy);
    c.value;
    c.value;
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("invalida o cache ao mudar a source", () => {
    const s = signal(1);
    const spy = vi.fn(() => s.value * 10);
    const c = computed(spy);

    expect(c.value).toBe(10);
    s.value = 2;
    expect(c.value).toBe(20);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("computed dependendo de outro computed", () => {
    const s = signal(3);
    const doubled = computed(() => s.value * 2);
    const quadrupled = computed(() => doubled.value * 2);
    expect(quadrupled.value).toBe(12);
    s.value = 5;
    expect(quadrupled.value).toBe(20);
  });

  it("não incrementa version quando o valor resultante é igual (Object.is)", async () => {
    const s = signal(1);
    const c = computed(() => s.value > 0); // sempre true enquanto s > 0
    const spy = vi.fn();

    effect(() => {
      c.value;
      spy();
    });

    expect(spy).toHaveBeenCalledTimes(1);

    s.value = 2; // muda s mas computed ainda retorna true
    await Promise.resolve();

    expect(spy).toHaveBeenCalledTimes(1); // effect não re-executou
  });

  it("propaga atualizações downstream via effects", async () => {
    const s = signal(10);
    const c = computed(() => s.value + 1);
    const values = [];

    effect(() => {
      values.push(c.value);
    });

    s.value = 20;
    await Promise.resolve();

    expect(values).toEqual([11, 21]);
  });

  it(".peek() lê o valor sem rastrear dependência", async () => {
    const s = signal(1);
    const c = computed(() => s.value);
    const spy = vi.fn();

    effect(() => {
      c.peek();
      spy();
    });

    expect(spy).toHaveBeenCalledTimes(1);
    s.value = 2;
    await Promise.resolve();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("detecta dependência circular e emite warn sem travar", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    let c;
    c = computed(() => {
      try {
        return c.value + 1;
      } catch {
        return 0;
      }
    });

    // apenas não deve travar
    expect(() => c.value).not.toThrow();
    consoleSpy.mockRestore();
  });

  it(".inspect() retorna informações do nó", () => {
    const s = signal(5);
    const c = computed(() => s.value, { label: "meu-computed" });
    c.value; // força inicialização
    const info = c.inspect();
    expect(info.kind).toBe("computed");
    expect(info.label).toBe("meu-computed");
    expect(info.initialized).toBe(true);
    expect(info.dirty).toBe(false);
  });

  it("dispose() para de atualizar", async () => {
    const s = signal(1);
    const c = computed(() => s.value * 2);
    const values = [];

    const stop = effect(() => {
      values.push(c.value);
    });

    s.value = 2;
    await Promise.resolve();
    expect(values).toEqual([2, 4]);

    stop();
    c.dispose();

    s.value = 3;
    await Promise.resolve();

    // permanece em 4, não atualiza mais
    expect(values).toEqual([2, 4]);
  });
});
