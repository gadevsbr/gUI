import { describe, test, expect, vi } from "vitest";
import { createStore, unwrapStore } from "../../gui/reactivity/store.js";
import { effect } from "../../gui/reactivity/effect.js";

describe("createStore()", () => {
  test("makes object properties reactive", async () => {
    const store = createStore({ count: 0, text: "foo" });
    let runs = 0;
    let latestCount = 0;

    effect(() => {
      latestCount = store.count;
      runs++;
    });

    expect(runs).toBe(1);
    expect(latestCount).toBe(0);

    store.count = 1;
    
    await Promise.resolve();
    
    expect(runs).toBe(2);
    expect(latestCount).toBe(1);
  });

  test("makes nested objects reactive", async () => {
    const store = createStore({ user: { name: "Hans" } });
    let runs = 0;
    let name = "";

    effect(() => {
      name = store.user.name;
      runs++;
    });

    expect(runs).toBe(1);
    expect(name).toBe("Hans");

    store.user.name = "Braga";
    
    await Promise.resolve();
    
    expect(runs).toBe(2);
    expect(name).toBe("Braga");
  });

  test("supports arrays", async () => {
    const store = createStore({ items: [1, 2, 3] });
    let runs = 0;
    let length = 0;

    effect(() => {
      length = store.items.length;
      runs++;
    });

    expect(runs).toBe(1);
    expect(length).toBe(3);

    store.items.push(4);
    
    await Promise.resolve();
    
    expect(runs).toBe(2);
    expect(length).toBe(4);
  });

  test("tracks iteration (ownKeys)", async () => {
    const store = createStore({ a: 1, b: 2 });
    let runs = 0;
    let keys = [];

    effect(() => {
      keys = Object.keys(store);
      runs++;
    });

    expect(runs).toBe(1);
    expect(keys).toEqual(["a", "b"]);

    store.c = 3;
    
    await Promise.resolve();
    
    expect(runs).toBe(2);
    expect(keys).toEqual(["a", "b", "c"]);
  });

  test("unwraps proxy", () => {
    const original = { a: 1 };
    const store = createStore(original);
    
    expect(store).not.toBe(original);
    expect(unwrapStore(store)).toBe(original);
  });
});
