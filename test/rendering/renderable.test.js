import { describe, it, expect, vi } from "vitest";
import { normalizeRenderable, sameNodeSequence } from "../../gui/rendering/renderable.js";
import { createTemplateResult } from "../../gui/rendering/templateResult.js";

describe("normalizeRenderable()", () => {
  it("trata null, undefined e false como nodes vazio", () => {
    expect(normalizeRenderable(null).nodes).toEqual([]);
    expect(normalizeRenderable(undefined).nodes).toEqual([]);
    expect(normalizeRenderable(false).nodes).toEqual([]);
  });

  it("converte texto para TextNode", () => {
    const result = normalizeRenderable("hello!");
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0] instanceof Text).toBe(true);
    expect(result.nodes[0].data).toBe("hello!");
  });

  it("converte número para TextNode", () => {
    const result = normalizeRenderable(42);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0] instanceof Text).toBe(true);
    expect(result.nodes[0].data).toBe("42");
  });

  it("mantém um Element no array", () => {
    const div = document.createElement("div");
    const result = normalizeRenderable(div);
    expect(result.nodes).toEqual([div]);
  });

  it("extrai filhos de um DocumentFragment", () => {
    const frag = document.createDocumentFragment();
    const a = document.createElement("a");
    const b = document.createElement("b");
    frag.appendChild(a);
    frag.appendChild(b);

    const result = normalizeRenderable(frag);
    expect(result.nodes).toEqual([a, b]);
  });

  it("extrai nodes de um TemplateResult com dispose configurado", () => {
    const nodes = [document.createElement("p")];
    const disposeFn = vi.fn();
    const templateResult = createTemplateResult(null, nodes, null, disposeFn);

    const result = normalizeRenderable(templateResult);
    expect(result.nodes).toEqual(nodes);
    
    // Verifica limpeza delegada
    expect(typeof result.cleanup).toBe("function");
    result.cleanup();
    expect(disposeFn).toHaveBeenCalledTimes(1);
  });

  it("nivela arrays de formas mistas", () => {
    const div = document.createElement("div");
    const frag = document.createDocumentFragment();
    const span = document.createElement("span");
    frag.appendChild(span);

    const result = normalizeRenderable([div, "texto", frag, false]);
    
    expect(result.nodes).toHaveLength(3);
    expect(result.nodes[0]).toBe(div);
    expect(result.nodes[1] instanceof Text).toBe(true);
    expect(result.nodes[1].data).toBe("texto");
    expect(result.nodes[2]).toBe(span);
  });

  it("insere comment quando array é vazio e preserveEmptyComment=true", () => {
    const result = normalizeRenderable([], {
      preserveEmptyComment: true,
      commentLabel: "empty-test",
    });

    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0] instanceof Comment).toBe(true);
    expect(result.nodes[0].data).toBe("empty-test");
  });

  it("retorna nodes vazio quando remove vazio e preserveEmptyComment=false", () => {
    const result = normalizeRenderable([]);
    expect(result.nodes).toHaveLength(0);
  });
});

describe("sameNodeSequence()", () => {
  it("identifica arrays idênticos", () => {
    const a = document.createElement("a");
    const b = document.createElement("b");
    const c = document.createElement("c");

    expect(sameNodeSequence([a, b], [a, b])).toBe(true);
    expect(sameNodeSequence([], [])).toBe(true);
    expect(sameNodeSequence([c], [c])).toBe(true);
  });

  it("identifica tamanhos diferentes", () => {
    const a = document.createElement("a");
    expect(sameNodeSequence([a], [a, a])).toBe(false);
    expect(sameNodeSequence([], [a])).toBe(false);
  });

  it("identifica elementos diferentes no mesmo índice", () => {
    const a = document.createElement("a");
    const b = document.createElement("b");
    expect(sameNodeSequence([a, b], [a, document.createElement("b")])).toBe(false);
  });
});
