import { effect } from "./effect.js";
import { createStore } from "./store.js";
import { isFunction } from "../utils/is.js";

function isSignal(s) {
  return s && typeof s === "object" && "value" in s && isFunction(s.inspect);
}

export function createResource(source, fetcher, options = {}) {
  let actualFetcher = fetcher;
  let readSource = source;

  if (arguments.length === 1 || (arguments.length === 2 && !isFunction(fetcher))) {
    actualFetcher = source;
    readSource = () => undefined;
    if (arguments.length === 2) {
      options = fetcher;
    }
  }

  const state = createStore({
    value: options?.initialValue,
    loading: false,
    error: undefined,
  });

  const refetch = async (currentSourceValue) => {
    state.loading = true;
    state.error = undefined;

    try {
      const data = await actualFetcher(currentSourceValue);
      state.value = data;
      return data;
    } catch (err) {
      state.error = err;
      throw err;
    } finally {
      state.loading = false;
    }
  };

  let lastSourceValue;

  effect(() => {
    let currentVal;
    
    if (isFunction(readSource)) {
      currentVal = readSource();
    } else if (isSignal(readSource)) {
      currentVal = readSource.value;
    } else {
      currentVal = readSource;
    }
    
    lastSourceValue = currentVal;
    refetch(currentVal).catch(() => {});
  }, { label: "resource:fetcher" });

  return {
    get value() { return state.value; },
    get loading() { return state.loading; },
    get error() { return state.error; },
    refetch: () => refetch(lastSourceValue),
  };
}
