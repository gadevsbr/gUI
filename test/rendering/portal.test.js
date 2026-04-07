import { describe, it, expect, afterEach } from "vitest";
import { Portal } from "../../gui/rendering/portal.js";
import { toTemplateNodes, html } from "../../gui/rendering/html.js";
import { signal } from "../../gui/reactivity/signal.js";
import { disposeTemplateResult } from "../../gui/rendering/templateResult.js";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Portal", () => {
  it("renderiza children dentro do target documentElement especificado", async () => {
    const target = document.createElement("div");
    target.id = "portal-root";
    document.body.appendChild(target);

    // Usa closure no html pra renderizar dinamicamente
    const portalTemplate = Portal("#portal-root", () => document.createTextNode("Hello Portal"));
    
    // Render
    const nodes = toTemplateNodes(portalTemplate);
    await Promise.resolve(); // Espera a reatividade inserir
    
    // O template em si retorna apenas markers (comentários HTML na ref nativa)
    expect(nodes[0].nodeType).toBe(Node.COMMENT_NODE);
    expect(nodes[0].data).toMatch(/portal/);
    
    // O target real tem que receber o childNode
    expect(target.childNodes.length).toBe(1);
    expect(target.firstChild.data).toBe("Hello Portal");
  });

  it("move portal nodes ao alterar Target via reatividade", async () => {
    const tA = document.createElement("div");
    const tB = document.createElement("div");
    document.body.appendChild(tA);
    document.body.appendChild(tB);

    const s = signal(tA);
    const view = Portal(() => s.value, () => html`<p>portal</p>`);
    
    toTemplateNodes(view);
    await Promise.resolve();
    
    expect(tA.childNodes.length).toBe(1);
    expect(tB.childNodes.length).toBe(0);

    // Troca
    s.value = tB;
    await Promise.resolve();
    
    expect(tA.childNodes.length).toBe(0);
    expect(tB.childNodes.length).toBe(1);
  });

  it("limpa conteúdo ao limpar o lifecycle result", async () => {
    const target = document.createElement("div");
    const cmp = Portal(target, () => html`<span/>`);
    
    toTemplateNodes(cmp);
    await Promise.resolve();
    expect(target.childNodes.length).toBe(1);
    
    disposeTemplateResult(cmp);
    expect(target.childNodes.length).toBe(0);
  });
});
