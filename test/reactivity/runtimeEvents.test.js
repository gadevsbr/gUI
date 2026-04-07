import { describe, it, expect, vi, afterEach } from "vitest";
import { signal } from "../../gui/reactivity/signal.js";
import { computed } from "../../gui/reactivity/computed.js";
import { effect } from "../../gui/reactivity/effect.js";
import {
  subscribeRuntimeEvents,
  createOwner,
  disposeOwner,
  withOwner,
} from "../../gui/reactivity/dependencyGraph.js";

describe("runtime events", () => {
  afterEach(() => {
    // cleanup: remover todos os listeners (subscribeRuntimeEvents retorna unsubscribe)
  });

  it("subscribeRuntimeEvents retorna função de unsubscribe", () => {
    const unsubscribe = subscribeRuntimeEvents(() => {});
    expect(typeof unsubscribe).toBe("function");
    unsubscribe();
  });

  it("emite signal:write ao escrever num signal", () => {
    const events = [];
    const unsubscribe = subscribeRuntimeEvents((e) => events.push(e));

    const s = signal(0);
    s.value = 42;

    unsubscribe();

    const writeEvent = events.find((e) => e.type === "signal:write");
    expect(writeEvent).toBeDefined();
    expect(writeEvent.timestamp).toBeTypeOf("number");
    expect(writeEvent.valueSummary).toBe("42");
  });

  it("não emite signal:write se o valor não mudou", () => {
    const events = [];
    const unsubscribe = subscribeRuntimeEvents((e) => events.push(e));

    const s = signal(5);
    s.value = 5; // mesmo valor

    unsubscribe();

    const writeEvents = events.filter((e) => e.type === "signal:write");
    expect(writeEvents).toHaveLength(0);
  });

  it("emite computed:refresh ao ler um computed sujo", () => {
    const events = [];
    const s = signal(1);
    const c = computed(() => s.value * 2);

    const unsubscribe = subscribeRuntimeEvents((e) => events.push(e));
    c.value; // força refresh

    unsubscribe();

    const refreshEvent = events.find((e) => e.type === "computed:refresh");
    expect(refreshEvent).toBeDefined();
    expect(refreshEvent.durationMs).toBeTypeOf("number");
    expect(typeof refreshEvent.changed).toBe("boolean");
  });

  it("emite computed:invalidate ao invalidar um computed", () => {
    const events = [];
    const s = signal(1);
    const c = computed(() => s.value);
    c.value; // inicializa

    const unsubscribe = subscribeRuntimeEvents((e) => events.push(e));
    s.value = 2; // invalida o computed

    unsubscribe();

    const invalidateEvent = events.find((e) => e.type === "computed:invalidate");
    expect(invalidateEvent).toBeDefined();
  });

  it("emite subscriber:flush ao executar um effect", async () => {
    const events = [];
    const s = signal(0);

    const unsubscribe = subscribeRuntimeEvents((e) => events.push(e));
    const stop = effect(() => s.value);

    s.value = 1;
    await Promise.resolve();

    unsubscribe();
    stop();

    const flushEvents = events.filter((e) => e.type === "subscriber:flush");
    expect(flushEvents.length).toBeGreaterThanOrEqual(1);
    expect(flushEvents[0].durationMs).toBeTypeOf("number");
  });

  it("emite subscriber:cleanup quando o effect limpa antes de re-executar", async () => {
    const events = [];
    const s = signal(0);

    const stop = effect(() => {
      s.value;
      return () => {}; // cleanup
    });

    const unsubscribe = subscribeRuntimeEvents((e) => events.push(e));
    s.value = 1;
    await Promise.resolve();

    unsubscribe();
    stop();

    const cleanupEvent = events.find((e) => e.type === "subscriber:cleanup");
    expect(cleanupEvent).toBeDefined();
  });

  it("emite owner:dispose ao dispor um owner", () => {
    const events = [];
    const unsubscribe = subscribeRuntimeEvents((e) => events.push(e));

    const owner = createOwner("test-owner");
    disposeOwner(owner);

    unsubscribe();

    const disposeEvent = events.find((e) => e.type === "owner:dispose");
    expect(disposeEvent).toBeDefined();
    expect(disposeEvent.owner.label).toBe("test-owner");
  });

  it("múltiplos listeners recebem o mesmo evento", () => {
    const results1 = [];
    const results2 = [];

    const u1 = subscribeRuntimeEvents((e) => results1.push(e));
    const u2 = subscribeRuntimeEvents((e) => results2.push(e));

    const s = signal(0);
    s.value = 1;

    u1();
    u2();

    expect(results1.length).toBeGreaterThan(0);
    expect(results1.length).toBe(results2.length);
  });

  it("após unsubscribe o listener não recebe mais eventos", () => {
    const events = [];
    const unsubscribe = subscribeRuntimeEvents((e) => events.push(e));
    unsubscribe();

    const s = signal(0);
    s.value = 99;

    expect(events).toHaveLength(0);
  });

  it("ignora listener que não é função", () => {
    const result = subscribeRuntimeEvents(null);
    expect(typeof result).toBe("function"); // retorna unsubscribe vazia
  });
});
