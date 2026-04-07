import { describe, it, expect } from "vitest";
import {
  isFunction,
  isObject,
  isNode,
  isDocumentFragment,
  isArray,
  isNullish,
  isBoolean,
} from "../../gui/utils/is.js";

describe("isFunction()", () => {
  it("retorna true para função nomeada", () => expect(isFunction(function foo() {})).toBe(true));
  it("retorna true para arrow function", () => expect(isFunction(() => {})).toBe(true));
  it("retorna true para função anônima", () => expect(isFunction(function () {})).toBe(true));
  it("retorna false para string", () => expect(isFunction("fn")).toBe(false));
  it("retorna false para null", () => expect(isFunction(null)).toBe(false));
  it("retorna false para objeto", () => expect(isFunction({})).toBe(false));
});

describe("isObject()", () => {
  it("retorna true para objeto vazio", () => expect(isObject({})).toBe(true));
  it("retorna true para array", () => expect(isObject([])).toBe(true));
  it("retorna false para null", () => expect(isObject(null)).toBe(false));
  it("retorna false para string", () => expect(isObject("str")).toBe(false));
  it("retorna false para número", () => expect(isObject(1)).toBe(false));
});

describe("isNode()", () => {
  it("retorna true para um elemento DOM", () => {
    const el = document.createElement("div");
    expect(isNode(el)).toBe(true);
  });

  it("retorna true para um TextNode", () => {
    const text = document.createTextNode("hello");
    expect(isNode(text)).toBe(true);
  });

  it("retorna true para um Comment", () => {
    const comment = document.createComment("x");
    expect(isNode(comment)).toBe(true);
  });

  it("retorna false para string", () => expect(isNode("div")).toBe(false));
  it("retorna false para null", () => expect(isNode(null)).toBe(false));
  it("retorna false para objeto simples", () => expect(isNode({})).toBe(false));
});

describe("isDocumentFragment()", () => {
  it("retorna true para DocumentFragment", () => {
    const frag = document.createDocumentFragment();
    expect(isDocumentFragment(frag)).toBe(true);
  });

  it("retorna false para elemento normal", () => {
    expect(isDocumentFragment(document.createElement("div"))).toBe(false);
  });

  it("retorna false para null", () => expect(isDocumentFragment(null)).toBe(false));
});

describe("isArray()", () => {
  it("retorna true para array", () => expect(isArray([1, 2, 3])).toBe(true));
  it("retorna true para array vazio", () => expect(isArray([])).toBe(true));
  it("retorna false para objeto", () => expect(isArray({})).toBe(false));
  it("retorna false para string", () => expect(isArray("abc")).toBe(false));
  it("retorna false para null", () => expect(isArray(null)).toBe(false));
});

describe("isNullish()", () => {
  it("retorna true para null", () => expect(isNullish(null)).toBe(true));
  it("retorna true para undefined", () => expect(isNullish(undefined)).toBe(true));
  it("retorna false para 0", () => expect(isNullish(0)).toBe(false));
  it("retorna false para string vazia", () => expect(isNullish("")).toBe(false));
  it("retorna false para false", () => expect(isNullish(false)).toBe(false));
});

describe("isBoolean()", () => {
  it("retorna true para true", () => expect(isBoolean(true)).toBe(true));
  it("retorna true para false", () => expect(isBoolean(false)).toBe(true));
  it("retorna false para 1", () => expect(isBoolean(1)).toBe(false));
  it("retorna false para string", () => expect(isBoolean("true")).toBe(false));
  it("retorna false para null", () => expect(isBoolean(null)).toBe(false));
});
