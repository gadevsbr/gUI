import { describe, it, expect, vi } from "vitest";
import { html, toTemplateNodes } from "../../gui/rendering/html.js";
import { signal } from "../../gui/reactivity/signal.js";
import { disposeTemplateResult } from "../../gui/rendering/templateResult.js";

describe("html() template engine", () => {
  it("renderiza template estático", () => {
    const view = html`<div>hello</div>`;
    const nodes = toTemplateNodes(view);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].tagName).toBe("DIV");
    expect(nodes[0].textContent).toBe("hello");
  });

  it("renderiza interpolação textual estática", () => {
    const text = "world";
    const view = html`<span>hello ${text}</span>`;
    const nodes = toTemplateNodes(view);

    expect(nodes[0].textContent).toBe("hello world");
  });

  it("renderiza atributo estático", () => {
    const view = html`<div id=${"meu-id"}></div>`;
    const nodes = toTemplateNodes(view);
    const div = nodes[0];

    expect(div.getAttribute("id")).toBe("meu-id");
  });

  it("renderiza boolean attributes estáticos", () => {
    const view1 = html`<button disabled=${true}></button>`;
    const view2 = html`<button disabled=${false}></button>`;

    expect(toTemplateNodes(view1)[0].disabled).toBe(true);
    expect(toTemplateNodes(view2)[0].disabled).toBe(false);
  });

  it("associa eventos nativamente com on:", () => {
    const spy = vi.fn();
    const view = html`<button on:click=${spy}>Click</button>`;
    const button = toTemplateNodes(view)[0];

    button.dispatchEvent(new Event("click"));
    expect(spy).toHaveBeenCalledTimes(1);
    
    // Testa limpeza
    disposeTemplateResult(view);
    button.dispatchEvent(new Event("click"));
    expect(spy).toHaveBeenCalledTimes(1); // não deve ter sido chamado de novo
  });

  it("renderiza template aninhado", () => {
    const child = html`<strong>inner</strong>`;
    const parent = html`<div>${child}</div>`;
    
    const div = toTemplateNodes(parent)[0];
    const innerNode = div.childNodes[0]; // element is first, comment anchor is second
    
    expect(innerNode.tagName).toBe("STRONG");
    expect(innerNode.textContent).toBe("inner");
  });

  it("renderiza array aninhado de templates e strings", () => {
    const list = ["a", html`<b>b</b>`];
    const view = html`<ul>${list}</ul>`;
    
    const ul = toTemplateNodes(view)[0];
    
    // anchor comment, text("a"), element B, anchor comment
    expect(ul.textContent).toBe("ab");
    expect(ul.querySelector("b")).toBeDefined();
  });

  it("reatividade: atualiza texto via closure binding", async () => {
    const s = signal("antes");
    // html() cria o owner, passa as depedências para bindings.js que as encapsula em functions
    const view = html`<p>${() => s.value}</p>`;
    const p = toTemplateNodes(view)[0];

    expect(p.textContent).toBe("antes");

    s.value = "depois";
    await Promise.resolve();

    expect(p.textContent).toBe("depois");
  });

  it("reatividade: atualiza atributo via closure binding", async () => {
    const s = signal("foo");
    const view = html`<div class=${() => s.value}></div>`;
    const div = toTemplateNodes(view)[0];

    expect(div.className).toBe("foo");

    s.value = "bar";
    await Promise.resolve();

    expect(div.className).toBe("bar");
  });
  
  it("reatividade: limpa os effects do template on dispose", async () => {
    const s = signal("foo");
    const view = html`<p>${() => s.value}</p>`;
    const p = toTemplateNodes(view)[0];

    disposeTemplateResult(view);
    
    // Modifica dps do dispose
    s.value = "bar";
    await Promise.resolve();

    expect(p.textContent).toBe("foo"); // não atualizou
  });

});
