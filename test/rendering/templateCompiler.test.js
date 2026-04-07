import { describe, it, expect } from "vitest";
import {
  readAttributeContext,
  compileTemplate,
  locateTemplateParts,
} from "../../gui/rendering/templateCompiler.js";

describe("readAttributeContext()", () => {
  it("retorna null quando não está dentro de uma tag HTML", () => {
    expect(readAttributeContext("some text before ")).toBeNull();
    expect(readAttributeContext("<div>text")).toBeNull();
  });

  it("retorna o nome do atributo quando a chunk termina em nome=", () => {
    expect(readAttributeContext("<div class=")).toBe("class");
    expect(readAttributeContext("<input type=")).toBe("type");
    expect(readAttributeContext("<button on:click=")).toBe("on:click");
  });

  it("retorna o nome do atributo quando há aspas parciais (nome=\")", () => {
    expect(readAttributeContext("<div class=\"")).toBe("class");
    expect(readAttributeContext("<div class='")).toBe("class");
  });

  it("retorna o nome do atributo considerando espaços (nome = )", () => {
    expect(readAttributeContext("<div data-value = ")).toBe("data-value");
  });
});

describe("compileTemplate()", () => {
  it("compila chunks em um template element com content correto", () => {
    const strings = ["<div class=\"", "\">", "</div>"];
    // Importante: Passando raw array em vez de tagged literal simulando comportamento do html\`...\`
    const { template, parts } = compileTemplate(strings);

    expect(template instanceof HTMLTemplateElement).toBe(true);
    expect(parts.length).toBe(2);
    expect(parts[0].type).toBe("attribute");
    expect(parts[0].name).toBe("class");
    expect(parts[1].type).toBe("node");
    
    // Part 0 era attr `class` -> vira '__gui_attr_0__'
    // Part 1 era text child -> vira '<!--gui-part:1-->'
    expect(template.innerHTML).toBe('<div class="__gui_attr_0__"><!--gui-part:1--></div>');
  });

  it("identifica corretamente eventos (on:)", () => {
    const strings = ["<button on:click=", ">Click</button>"];
    const { parts } = compileTemplate(strings);
    expect(parts.length).toBe(1);
    expect(parts[0].type).toBe("event");
    expect(parts[0].name).toBe("on:click");
  });

  it("usa cache para arrays de strings iterados multiplas vezes", () => {
    const strings = ["<p>", "</p>"];
    const result1 = compileTemplate(strings);
    const result2 = compileTemplate(strings);
    expect(result1).toBe(result2); // Referência idêntica
  });
});

describe("locateTemplateParts()", () => {
  it("localiza e associa corretamente parts iterando o DocumentFragment", () => {
    const strings = ["<div id=\"", "\">", "</div>"];
    const { template, parts } = compileTemplate(strings);
    const fragment = template.content.cloneNode(true);
    
    const located = locateTemplateParts(fragment, parts);
    
    expect(located.length).toBe(2);
    
    // Part 0 é attribute
    expect(located[0].type).toBe("attribute");
    expect(located[0].name).toBe("id");
    expect(located[0].element).toBeInstanceOf(Element);
    
    // Part 1 é node
    expect(located[1].type).toBe("node");
    expect(located[1].anchor).toBeInstanceOf(Comment);
    expect(located[1].currentType).toBe("empty");
    expect(located[1].currentNodes).toEqual([]);
    
    // Confirma que os atributos __gui_attr_*__ foram removidos dos elementos
    expect(located[0].element.hasAttribute("id")).toBe(false);
  });
});
