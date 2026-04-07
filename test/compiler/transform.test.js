import { describe, it, expect } from "vitest";
import { transformGuiTemplates } from "../../gui/compiler/transform.js";

function compile(code) {
  return transformGuiTemplates(code);
}

describe("transformGuiTemplates (compiler)", () => {
  it("não wrapa nada que não tenha tags html", () => {
    const code = "const a = 1;";
    const result = compile(code);
    expect(result.code).toBe(code);
    expect(result.changed).toBe(false);
  });

  it("wrapa interpolações que resolvem com valores comuns dentro do html``", () => {
    const code = "html`<span>${count.value}</span>`";
    const result = compile(code);
    expect(result.code).toBe("html`<span>${() => (count.value)}</span>`");
    expect(result.changed).toBe(true);
  });

  it("preserva literals puros (primitivos) mas os encerra em wrappers por padrão pois não pode ter certeza do tipo", () => {
    const code = "html`<p>${1}</p>`";
    const result = compile(code);
    expect(result.code).toBe("html`<p>${() => (1)}</p>`");
  });

  it("ignora (não double-wrapa) => functions", () => {
    const code = "html`<div>${() => state.val}</div>`";
    const result = compile(code);
    expect(result.code).toBe(code); // sem change
  });

  it("ignora 'function () {}' tradicionais", () => {
    const code = "html`<div>${function() { return 1; }}</div>`";
    const result = compile(code);
    expect(result.code).toBe(code);
  });

  it("não wrapa valores on:xxxx", () => {
    const code = "html`<button on:click=${handleClick}>click</button>`";
    const result = compile(code);
    expect(result.code).toBe("html`<button on:click=${handleClick}>click</button>`");
  });

  it("bloqueia wrapping de awaits top-level dentro de exp", () => {
    const code = "html`<div>${await fetchVal()}</div>`";
    const result = compile(code);
    expect(result.code).toBe("html`<div>${await fetchVal()}</div>`"); // sem arrow wrapping, ia dar await Syntax error se virar arrow padrao s/ async.
  });

  it("template literal aninhados não quebram parse", () => {
    const code = "html`<div>${html`<span>hi</span>`}</div>`";
    const result = compile(code);
    // Inner HTML is transformed and outer HTML gets inner wrapped
    expect(result.code).toBe("html`<div>${() => (html`<span>hi</span>`)}</div>`");
  });
  
  it("lidar apropriamente com comentários dentro do scope / expression parser state", () => {
    // Parser n deve corromper no index se tem block comment dentro exp
    const code = "html`<p>${ /* num */ 123 }</p>`";
    const result = compile(code);
    expect(result.code).toBe("html`<p>${() => ( /* num */ 123 )}</p>`");
  });

  it("lidar com expressões com strings complexas q contenham } sem errar parser tree delimiter", () => {
    const code = "html`<img alt=${ 'text}' }>`";
    const result = compile(code);
    expect(result.code).toBe("html`<img alt=${() => ( 'text}' )}>`");
  });

  it("não wrapa expressões com comentário de opt-out /* gui:ignore */", () => {
    const code = "html`<p>${ /* gui:ignore */ track() }</p>`";
    const result = compile(code);
    
    // Continua literalmente o mesmo, não cria arrow function
    expect(result.code).toBe("html`<p>${ /* gui:ignore */ track() }</p>`");
  });

  it("não wrapa expressões com comentário de opt-out /* gui:skip */", () => {
    const code = "html`<p>${/*  gui:skip  */  track() }</p>`";
    const result = compile(code);
    expect(result.code).toBe("html`<p>${/*  gui:skip  */  track() }</p>`");
  });

  it("falha com SyntaxError indicativo e exibe o Code Frame visual", () => {
    const code = `
const a = 1;

html\`<div>\${ \`;
    `;
    
    expect(() => compile(code)).toThrow(/Unterminated template literal at/);
    
    try {
      compile(code);
    } catch (e) {
      expect(e.message).toMatch(/html`<div>\${ \`;/); // Linha apontada no code frame
      expect(e.message).toMatch(/> 5 | html`<div>\${ \`;/); // Prefix do erro na view
      expect(e.message).toMatch(/   \| {14}\^/); // Ponteiro na coluna!
    }
  });
});
