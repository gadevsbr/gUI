import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "../../gui/core/mount.js";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("mount()", () => {
  it("monta elemento usando seletor CSS no DOM", () => {
    const root = document.createElement("div");
    root.id = "app";
    document.body.appendChild(root);

    const span = document.createElement("span");
    span.textContent = "opa";
    
    const mounted = mount("#app", span);
    expect(mounted.container).toBe(root);
    expect(root.firstChild).toBe(span);
    expect(mounted.nodes).toEqual([span]);
  });

  it("monta direto em Node passado como target", () => {
    const root = document.createElement("section");
    const result = mount(root, "texto puro");
    
    expect(result.container).toBe(root);
    expect(root.firstChild.nodeType).toBe(Node.TEXT_NODE);
    expect(root.firstChild.data).toBe("texto puro");
  });

  it("lança erro se o seletor não existe", () => {
    expect(() => mount("#fantasma", "boo")).toThrow(/not was found|was not found/i);
  });

  it("lança erro se target não for node nem string", () => {
    expect(() => mount({}, "boo")).toThrow(/Mount target must be/);
  });

  it("substitui as children originais pelo Node (replaceChildren)", () => {
    const root = document.createElement("div");
    root.appendChild(document.createElement("p"));
    
    mount(root, document.createTextNode("novo"));
    expect(root.childNodes.length).toBe(1);
    expect(root.firstChild.data).toBe("novo");
  });

  it("fallback para string se passar valor desconhecido (ex: undefined)", () => {
    const root = document.createElement("div");
    mount(root, undefined); // undefined não é nó nem template
    
    // Na v1.1 um fallback insere empty comentário (normalizeRootValue usa parse preserveEmptyComment)
    expect(root.firstChild.nodeType === Node.COMMENT_NODE).toBe(true);
  });

  it("retorna handle com cleanup unmount()", () => {
    const root = document.createElement("div");
    const span = document.createElement("span");
    const mounted = mount(root, span);
    
    expect(root.contains(span)).toBe(true);
    mounted.unmount();
    expect(root.contains(span)).toBe(false);
  });
});
