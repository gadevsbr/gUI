import { describe, it, expect, vi } from "vitest";
import { list } from "../../gui/rendering/list.js";
import { html, toTemplateNodes } from "../../gui/rendering/html.js";
import { signal } from "../../gui/reactivity/signal.js";
import { effect } from "../../gui/reactivity/effect.js";

describe("list()", () => {
  it("retorna uma configuração de binding estrutural", () => {
    const binding = list([], "id", () => "item");
    // O symbol interno impede teste direito sem reflexão, verificamos campos exportados
    expect(binding.source).toEqual([]);
    expect(binding.key).toBe("id");
    expect(typeof binding.render).toBe("function");
  });

  it("lança erro se render não for função", () => {
    expect(() => list([], "id", null)).toThrow(/must be a function/);
  });

  it("renderiza lista inicial a partir de um signal array", async () => {
    const rows = signal([{ id: 1, text: "A" }, { id: 2, text: "B" }]);
    const render = (item) => html`<li>${() => item.value.text}</li>`;
    const view = html`<ul>${list(rows, "id", render)}</ul>`;
    
    // Aguarda o mount do effect do list (sugerido por list creation estar num effect)
    await Promise.resolve();
    
    const ul = toTemplateNodes(view)[0];
    const lis = ul.querySelectorAll("li");
    
    expect(lis.length).toBe(2);
    expect(lis[0].textContent).toBe("A");
    expect(lis[1].textContent).toBe("B");
  });

  it("renderiza elementos primitivos extraindo chave com index signal", async () => {
    const rows = signal(["a", "b"]);
    // extract key by prop-name -> if primitve, undefined fallback to duplicate handling
    // We should use a key getter function
    const render = (item, index) => html`<li>${() => item.value} - ${() => index.value}</li>`;
    const view = html`<ul>${list(rows, (x) => x, render)}</ul>`;
    
    await Promise.resolve();
    
    const lis = toTemplateNodes(view)[0].querySelectorAll("li");
    expect(lis[0].textContent).toBe("a - 0");
    expect(lis[1].textContent).toBe("b - 1");
  });

  it("preserva ownership de itens existentes reordenando DOM", async () => {
    const rows = signal([{ id: 1, text: "A" }, { id: 2, text: "B" }]);
    let renderCounts = 0;
    
    const render = (item) => {
      renderCounts++;
      return html`<li>${() => item.value.text}</li>`;
    };
    
    const view = html`<ul>${list(rows, "id", render)}</ul>`;
    await Promise.resolve();
    
    expect(renderCounts).toBe(2); // Mount initial
    
    const ul = toTemplateNodes(view)[0];
    const initialLi1 = ul.querySelectorAll("li")[0];
    
    // REVERSE order
    rows.value = [{ id: 2, text: "B" }, { id: 1, text: "A" }];
    await Promise.resolve();
    
    expect(renderCounts).toBe(2); // NÃO deve reclonar os itens do fragment
    
    const lis = ul.querySelectorAll("li");
    expect(lis[0].textContent).toBe("B");
    expect(lis[1].textContent).toBe("A");
    
    // A referência ao DOM Node continuou exatamente a mesma, apenas Move in dom foi feito
    expect(lis[1]).toBe(initialLi1);
  });

  it("cria novos nodes e remove stales (insert and remove)", async () => {
    const rows = signal([{ id: 1 }]);
    const render = (item) => html`<li>${() => item.value.id}</li>`;
    const view = html`<ul>${list(rows, "id", render)}</ul>`;
    await Promise.resolve();
    
    const ul = toTemplateNodes(view)[0];
    expect(ul.querySelectorAll("li").length).toBe(1);
    
    rows.value = [{ id: 2 }, { id: 3 }]; // remove 1, add 2 e 3
    await Promise.resolve();
    
    const lis = ul.querySelectorAll("li");
    expect(lis.length).toBe(2);
    expect(lis[0].textContent).toBe("2");
    expect(lis[1].textContent).toBe("3");
  });

  it("limpa owner do item renderizado da lista quando o item sai da lista", async () => {
    const rows = signal([{ id: 1 }]);
    const spyCleanup = vi.fn();
    
    // O effect registra cleanup no owner do item
    const view = html`<ul>${list(rows, "id", () => {
      effect(() => spyCleanup);
      return html`<p>Item</p>`;
    })}</ul>`;
    
    await Promise.resolve(); // render
    expect(spyCleanup).toHaveBeenCalledTimes(0);
    
    rows.value = []; // remove do DOM
    await Promise.resolve();
    
    expect(spyCleanup).toHaveBeenCalledTimes(1); 
  });
});
