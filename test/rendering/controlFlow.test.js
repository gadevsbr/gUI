import { describe, it, expect, vi } from "vitest";
import { Show, Switch, Match } from "../../gui/rendering/controlFlow.js";
import { signal } from "../../gui/reactivity/signal.js";
import { effect } from "../../gui/reactivity/effect.js";

describe("Show", () => {
  it("renderiza children se when for truthy", () => {
    const childrenFn = vi.fn(() => "visible");
    const fallbackFn = vi.fn(() => "hidden");
    const cmp = Show({ when: true, children: childrenFn, fallback: fallbackFn });
    
    expect(cmp()).toBe("visible");
    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(fallbackFn).toHaveBeenCalledTimes(0);
  });

  it("renderiza fallback se when for falsy", () => {
    const childrenFn = vi.fn(() => "visible");
    const cmp = Show({ when: 0, children: childrenFn, fallback: "hidden" });
    
    expect(cmp()).toBe("hidden");
    expect(childrenFn).toHaveBeenCalledTimes(0);
  });

  it("quando child ou fallback for signal é resolvido nativamente no bind do nó", () => {
    // Show() retorna algo que pode ser acoplado no html()
    // Então retorna função
    const when = signal(true);
    const viewFn = Show({ when: () => when.value, children: () => "A", fallback: () => "B" });
    
    expect(viewFn()).toBe("A");
  });
});

describe("Switch e Match", () => {
  it("avaliamos o primeiro match verdadeiro", () => {
    const cases = [
      Match({ when: false, children: () => "Failed" }),
      Match({ when: true, children: () => "Success A" }),
      Match({ when: true, children: () => "Success B" }),
    ];
    
    const viewFn = Switch(cases, () => "Fallback");
    expect(viewFn()).toBe("Success A");
  });

  it("se nenhum bater, usamos fallback", () => {
    const cases = [
      Match({ when: false, children: () => "1" }),
      Match({ when: 0, children: () => "2" })
    ];
    
    const viewFn = Switch(cases, () => "F");
    expect(viewFn()).toBe("F");
  });

  it("Switch pode receber array e resolve primitivos", () => {
    const casos = [
      Match({ when: null, children: "Vazio" }),
      Match({ when: true, children: "Cheio" })
    ];
    // Se o children for primitivo estático
    expect(Switch(casos)()).toBe("Cheio");
  });

  it("Suporta fallback vazio implicitamente", () => {
    const viewFn = Switch([Match({ when: false, children: 'A' })]);
    expect(viewFn()).toBeNull();
  });
});
