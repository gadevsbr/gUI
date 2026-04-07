import { describe, it, expect, vi } from "vitest";
import { mergeProps, splitProps } from "../../gui/composition/props.js";
import { effect } from "../../gui/reactivity/effect.js";
import { signal } from "../../gui/reactivity/signal.js";

describe("mergeProps()", () => {
  it("mescla múltiplos objetos num só", () => {
    const a = { x: 1 };
    const b = { y: 2, z: 3 };
    const merged = mergeProps(a, b);
    
    expect(merged.x).toBe(1);
    expect(merged.y).toBe(2);
    expect(merged.z).toBe(3);
  });

  it("objetos da direita sobrescrevem os da esquerda", () => {
    const a = { x: 1 };
    const b = { x: 99 };
    const merged = mergeProps(a, b);
    
    expect(merged.x).toBe(99);
  });

  it("ignora sources vazios ou nulos", () => {
    const a = { a: 1 };
    const merged = mergeProps(null, a, undefined);
    
    expect(merged.a).toBe(1);
  });

  it("preserva avaliação lazy / garante que não acessa getters até necessidade (vital pra components)", () => {
    let acessado = false;
    const propsComGetter = {
      get v() {
        acessado = true;
        return 42;
      }
    };
    
    const merged = mergeProps({ obj: 1 }, propsComGetter);
    
    expect(acessado).toBe(false); // apenas ao criar as props não deve ter acesso
    expect(merged.v).toBe(42); 
    expect(acessado).toBe(true);
  });

  it("retorna undefined para propriedade inexistente", () => {
    const merged = mergeProps({ a: 1 });
    expect(merged.b).toBeUndefined();
  });

  it("Reflect.ownKeys funciona mapeando as keys do source", () => {
    const merged = mergeProps({ a: 1 }, { b: 2, a: 3 });
    const chaves = Reflect.ownKeys(merged);
    
    expect(chaves).toContain("a");
    expect(chaves).toContain("b");
    expect(chaves.length).toBe(2);
  });

  it("operador in funciona perfeitamente na proxy", () => {
     const merged = mergeProps({ x: 1 }, { p: 2 });
     expect("x" in merged).toBe(true);
     expect("p" in merged).toBe(true);
     expect("b" in merged).toBe(false);
  });
});

describe("splitProps()", () => {
  it("separa as propriedades nos grupos esperados e cria rest no final", () => {
    const props = { a: 1, b: 2, c: 3, d: 4 };
    const [ab, c, rest] = splitProps(props, ["a", "b"], ["c"]);
    
    expect(ab.a).toBe(1);
    expect(ab.b).toBe(2);
    expect(ab.c).toBeUndefined();

    expect(c.c).toBe(3);
    
    expect(rest.d).toBe(4);
    expect(rest.a).toBeUndefined();
  });

  it("mantém resolução de keys com proxies (não acessa eager getters)", () => {
    let accA = false;
    let accB = false;

    const props = {
      get a() { accA = true; return 1; },
      get b() { accB = true; return 2; },
    };

    const [gpA, gpRest] = splitProps(props, ["a"]);

    expect(accA).toBe(false);
    expect(accB).toBe(false);

    // acessar gpA executa
    expect(gpA.a).toBe(1);
    expect(accA).toBe(true);
    expect(accB).toBe(false);

    // rest chama b
    expect(gpRest.b).toBe(2);
    expect(accB).toBe(true);
  });

  it("comporta operando 'in' nos slots definidos e non definids", () => {
    const p = { local: true, global: false };
    const [local, rest] = splitProps(p, ["local"]);

    expect("local" in local).toBe(true);
    expect("global" in local).toBe(false);

    expect("global" in rest).toBe(true);
    expect("local" in rest).toBe(false);
  });

  it("Reflect.ownKeys itera corretamente as props filtradas", () => {
     const p = { a: 1, b: 2, c: 3 };
     const [ab, rest] = splitProps(p, ["a", "b"]);
     expect(Reflect.ownKeys(ab)).toEqual(["a", "b"]);
     expect(Reflect.ownKeys(rest)).toEqual(["c"]);
  });
});
