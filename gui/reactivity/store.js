import { signal } from "./signal.js";
import { isArray, isFunction, isObject } from "../utils/is.js";

const STORE_RAW = Symbol("gui.store.raw");
const proxyMap = new WeakMap();

export function createStore(initialValue) {
  if (!isObject(initialValue)) {
    throw new Error("[gUI] createStore requires an object or array.");
  }

  return createProxy(initialValue);
}

function createProxy(target) {
  if (target[STORE_RAW]) {
    return target;
  }

  if (proxyMap.has(target)) {
    return proxyMap.get(target);
  }

  const signals = new Map();
  const iterators = signal(0); // Tracks iteration (keys, length)

  const proxy = new Proxy(target, {
    get(obj, prop, receiver) {
      if (prop === STORE_RAW) {
        return obj;
      }

      const value = Reflect.get(obj, prop, receiver);

      if (typeof prop === "symbol" || isFunction(value)) {
        // For array functions like .map(), .filter(), etc.
        // We bind them to the proxy so internal accesses trigger gets
        if (isArray(obj) && typeof value === "function" && typeof Array.prototype[prop] === "function") {
          return function (...args) {
            return value.apply(proxy, args);
          };
        }
        return value;
      }

      let s = signals.get(prop);
      if (!s) {
        s = signal(value);
        signals.set(prop, s);
      }

      // Access the value to establish the dependency in the current owner
      const readValue = s.value;

      if (isObject(readValue) && readValue !== null) {
        return createProxy(readValue);
      }

      return readValue;
    },

    set(obj, prop, value, receiver) {
      if (prop === STORE_RAW) return false;

      const unwrappedValue = value && value[STORE_RAW] ? value[STORE_RAW] : value;
      const oldValue = Reflect.get(obj, prop, receiver);
      const isNewProperty = !Object.prototype.hasOwnProperty.call(obj, prop);
      
      const success = Reflect.set(obj, prop, unwrappedValue, receiver);

      if (success) {
        if (oldValue !== unwrappedValue || isNewProperty) {
          let s = signals.get(prop);
          if (!s) {
            s = signal(unwrappedValue);
            signals.set(prop, s);
          } else {
            s.value = unwrappedValue;
          }

          if (isArray(obj) && prop !== "length") {
            const ls = signals.get("length");
            if (ls && ls.value !== obj.length) {
              ls.value = obj.length;
            }
          }

          if (isNewProperty) {
            iterators.value += 1;
          }
        }
      }

      return success;
    },

    deleteProperty(obj, prop) {
      const hasProp = Object.prototype.hasOwnProperty.call(obj, prop);
      const success = Reflect.deleteProperty(obj, prop);

      if (success && hasProp) {
        let s = signals.get(prop);
        if (s) {
          s.value = undefined;
        }
        iterators.value += 1;
      }

      return success;
    },

    ownKeys(obj) {
      iterators.value; // track iteration
      return Reflect.ownKeys(obj);
    }
  });

  proxyMap.set(target, proxy);
  return proxy;
}

export function unwrapStore(proxy) {
  return proxy && proxy[STORE_RAW] ? proxy[STORE_RAW] : proxy;
}
