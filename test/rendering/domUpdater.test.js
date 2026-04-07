import { describe, it, expect, vi, afterEach } from "vitest";
import {
  setTextContent,
  setAttributeValue,
  insertNodesBefore,
  removeNodes,
  appendNodes,
  subscribeDomUpdates,
  setDomUpdateHook,
} from "../../gui/rendering/domUpdater.js";

// Helper: cria container com anchor
function makeContainer() {
  const div = document.createElement("div");
  const anchor = document.createComment("anchor");
  div.appendChild(anchor);
  document.body.appendChild(div);
  return { div, anchor };
}

afterEach(() => {
  document.body.innerHTML = "";
  setDomUpdateHook(null);
});

describe("setTextContent()", () => {
  it("atualiza o conteúdo do TextNode", () => {
    const node = document.createTextNode("");
    setTextContent(node, "hello");
    expect(node.data).toBe("hello");
  });

  it("converte null para string vazia", () => {
    const node = document.createTextNode("x");
    setTextContent(node, null);
    expect(node.data).toBe("");
  });

  it("converte false para string vazia", () => {
    const node = document.createTextNode("x");
    setTextContent(node, false);
    expect(node.data).toBe("");
  });

  it("converte número para string", () => {
    const node = document.createTextNode("");
    setTextContent(node, 42);
    expect(node.data).toBe("42");
  });

  it("não emite evento quando o valor não muda", () => {
    const events = [];
    const unsub = subscribeDomUpdates((e) => events.push(e));
    const node = document.createTextNode("mesmo");
    setTextContent(node, "mesmo");
    unsub();
    expect(events.filter((e) => e.type === "text")).toHaveLength(0);
  });

  it("emite evento text quando o valor muda", () => {
    const events = [];
    const unsub = subscribeDomUpdates((e) => events.push(e));
    const node = document.createTextNode("antes");
    setTextContent(node, "depois");
    unsub();
    const textEvents = events.filter((e) => e.type === "text");
    expect(textEvents).toHaveLength(1);
    expect(textEvents[0].value).toBe("depois");
  });
});

describe("setAttributeValue()", () => {
  it("define atributo string no elemento", () => {
    const el = document.createElement("input");
    setAttributeValue(el, "placeholder", "Digite aqui");
    expect(el.getAttribute("placeholder")).toBe("Digite aqui");
  });

  it("define class via alias className", () => {
    const el = document.createElement("div");
    setAttributeValue(el, "class", "minha-classe");
    expect(el.className).toBe("minha-classe");
  });

  it("define readonly via alias readOnly", () => {
    const el = document.createElement("input");
    setAttributeValue(el, "readonly", true);
    expect(el.readOnly).toBe(true);
  });

  it("define atributo booleano disabled=true", () => {
    const el = document.createElement("button");
    setAttributeValue(el, "disabled", true);
    expect(el.disabled).toBe(true);
  });

  it("remove atributo booleano disabled=false", () => {
    const el = document.createElement("button");
    el.disabled = true;
    setAttributeValue(el, "disabled", false);
    expect(el.disabled).toBe(false);
  });

  it("remove atributo quando valor é null", () => {
    const el = document.createElement("div");
    el.setAttribute("data-x", "1");
    setAttributeValue(el, "data-x", null);
    expect(el.hasAttribute("data-x")).toBe(false);
  });

  it("remove atributo quando valor é undefined", () => {
    const el = document.createElement("div");
    el.setAttribute("data-x", "1");
    setAttributeValue(el, "data-x", undefined);
    expect(el.hasAttribute("data-x")).toBe(false);
  });
});

describe("insertNodesBefore()", () => {
  it("insere nó antes do anchor", () => {
    const { div, anchor } = makeContainer();
    const span = document.createElement("span");
    insertNodesBefore(anchor, [span]);
    expect(div.childNodes[0]).toBe(span);
    expect(div.childNodes[1]).toBe(anchor);
  });

  it("emite evento structure:insert para nó novo", () => {
    const { anchor } = makeContainer();
    const events = [];
    const unsub = subscribeDomUpdates((e) => events.push(e));
    const span = document.createElement("span");
    insertNodesBefore(anchor, [span]);
    unsub();
    const structEvents = events.filter((e) => e.type === "structure");
    expect(structEvents[0].action).toBe("insert");
  });

  it("emite evento structure:move para nó que já tem parent", () => {
    const { div, anchor } = makeContainer();
    const other = document.createElement("div");
    document.body.appendChild(other);
    const span = document.createElement("span");
    other.appendChild(span);

    const events = [];
    const unsub = subscribeDomUpdates((e) => events.push(e));
    insertNodesBefore(anchor, [span]);
    unsub();

    const structEvents = events.filter((e) => e.type === "structure");
    expect(structEvents[0].action).toBe("move");
    expect(div.contains(span)).toBe(true);
  });

  it("insere múltiplos nós em ordem", () => {
    const { div, anchor } = makeContainer();
    const a = document.createElement("a");
    const b = document.createElement("b");
    insertNodesBefore(anchor, [a, b]);
    expect(div.childNodes[0]).toBe(a);
    expect(div.childNodes[1]).toBe(b);
    expect(div.childNodes[2]).toBe(anchor);
  });
});

describe("removeNodes()", () => {
  it("remove o nó do DOM", () => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    div.appendChild(span);
    document.body.appendChild(div);
    removeNodes([span]);
    expect(div.contains(span)).toBe(false);
  });

  it("emite evento structure:remove", () => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    div.appendChild(span);
    document.body.appendChild(div);

    const events = [];
    const unsub = subscribeDomUpdates((e) => events.push(e));
    removeNodes([span]);
    unsub();

    const removeEvents = events.filter((e) => e.type === "structure" && e.action === "remove");
    expect(removeEvents).toHaveLength(1);
  });

  it("ignora nós que não estão no DOM (sem parentNode)", () => {
    const orphan = document.createElement("span");
    expect(() => removeNodes([orphan])).not.toThrow();
  });
});

describe("subscribeDomUpdates()", () => {
  it("retorna função de unsubscribe", () => {
    const unsub = subscribeDomUpdates(() => {});
    expect(typeof unsub).toBe("function");
    unsub();
  });

  it("unsubscribe remove o listener", () => {
    const events = [];
    const unsub = subscribeDomUpdates((e) => events.push(e));
    unsub();

    const node = document.createTextNode("a");
    setTextContent(node, "b");
    expect(events).toHaveLength(0);
  });

  it("ignora listener não-função e retorna no-op", () => {
    const result = subscribeDomUpdates("não é função");
    expect(typeof result).toBe("function");
    result(); // não deve lançar
  });
});

describe("setDomUpdateHook()", () => {
  it("o hook recebe eventos de DOM updates", () => {
    const hook = vi.fn();
    setDomUpdateHook(hook);

    const node = document.createTextNode("x");
    setTextContent(node, "y");

    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook.mock.calls[0][0].type).toBe("text");
  });

  it("setDomUpdateHook(null) remove o hook", () => {
    const hook = vi.fn();
    setDomUpdateHook(hook);
    setDomUpdateHook(null);

    const node = document.createTextNode("x");
    setTextContent(node, "y");

    expect(hook).not.toHaveBeenCalled();
  });
});
