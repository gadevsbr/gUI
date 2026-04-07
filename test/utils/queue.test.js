import { describe, it, expect } from "vitest";
import { createQueue } from "../../gui/utils/queue.js";

describe("createQueue()", () => {
  it("começa vazia (size === 0)", () => {
    const q = createQueue();
    expect(q.size).toBe(0);
  });

  it("add() retorna true ao adicionar item novo", () => {
    const q = createQueue();
    const fn = () => {};
    expect(q.add(fn)).toBe(true);
  });

  it("add() retorna false ao adicionar item duplicado", () => {
    const q = createQueue();
    const fn = () => {};
    q.add(fn);
    expect(q.add(fn)).toBe(false);
  });

  it("size aumenta ao adicionar itens únicos", () => {
    const q = createQueue();
    q.add(() => {});
    q.add(() => {});
    expect(q.size).toBe(2);
  });

  it("drain() retorna todos os itens como array", () => {
    const q = createQueue();
    const a = () => {};
    const b = () => {};
    q.add(a);
    q.add(b);
    const batch = q.drain();
    expect(batch).toContain(a);
    expect(batch).toContain(b);
    expect(batch.length).toBe(2);
  });

  it("drain() esvazia a fila (size === 0 após drain)", () => {
    const q = createQueue();
    q.add(() => {});
    q.add(() => {});
    q.drain();
    expect(q.size).toBe(0);
  });

  it("pode adicionar e drenar múltiplas vezes", () => {
    const q = createQueue();
    const fn1 = () => {};
    const fn2 = () => {};

    q.add(fn1);
    expect(q.drain()).toHaveLength(1);

    q.add(fn2);
    expect(q.drain()).toHaveLength(1);
    expect(q.size).toBe(0);
  });

  it("drain() numa fila vazia retorna array vazio", () => {
    const q = createQueue();
    expect(q.drain()).toEqual([]);
  });

  it("add() não adiciona o mesmo item após ele ter sido drenado", () => {
    const q = createQueue();
    const fn = () => {};
    q.add(fn);
    q.drain();
    // agora pode adicionar de novo
    expect(q.add(fn)).toBe(true);
    expect(q.size).toBe(1);
  });
});
