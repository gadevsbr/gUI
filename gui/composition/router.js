import { signal } from "../reactivity/signal.js";
import { Switch, MATCH } from "../rendering/controlFlow.js";

const currentPath = signal("");
let initialized = false;
let routerMode = "hash";

function getPath() {
  if (routerMode === "history") {
    return window.location.pathname;
  }
  const hash = window.location.hash;
  return hash && hash.length > 1 ? hash.slice(1) : "/";
}

function handleNavigate() {
  currentPath.value = getPath();
}

function initRouter(mode) {
  if (initialized) return;
  initialized = true;
  routerMode = mode;
  
  currentPath.value = getPath();
  
  window.addEventListener(mode === "history" ? "popstate" : "hashchange", handleNavigate);
}

export function push(path) {
  if (routerMode === "history") {
    window.history.pushState(null, "", path);
  } else {
    window.location.hash = path;
  }
  // Synchronously update signal for immediate reactivity
  currentPath.value = getPath();
}

export function replace(path) {
  if (routerMode === "history") {
    window.history.replaceState(null, "", path);
  } else {
    const origin = window.location.origin + window.location.pathname + window.location.search;
    window.location.replace(origin + "#" + path);
  }
  currentPath.value = getPath();
}

function compilePath(path) {
  if (path === "*") {
    return {
      regex: /.*/,
      keys: []
    };
  }

  const keys = [];
  // Ensure we escape any special regex characters outside of params if needed, but for MVP keep it simple.
  const safePath = path.replace(/[.+?^${}()|[\]\\]/g, "\\$&"); // Escape regex chars
  const pattern = safePath.replace(/:([^\/]+)/g, (_, key) => {
    keys.push(key);
    return "([^/]+)";
  });
  
  return {
    regex: new RegExp(`^${pattern}/?$`),
    keys
  };
}

export function Route(options, children) {
  const path = options.path;
  const { regex, keys } = compilePath(path);
  
  return {
    [MATCH]: true,
    when: () => {
      const p = currentPath.value;
      const match = p.match(regex);
      if (!match) return null;
      
      const params = {};
      for (let i = 0; i < keys.length; i++) {
        params[keys[i]] = decodeURIComponent(match[i + 1] || "");
      }
      return Object.keys(params).length > 0 ? params : true;
    },
    children
  };
}

export function Router(options, routes) {
  const mode = options?.mode || "hash";
  initRouter(mode);
  
  if (mode === "history") {
    if (!window.__gui_router_click) {
      window.__gui_router_click = true;
      document.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (!a || !a.href) return;
        
        // Skip cross-origin, downloads, logic-modifying clicks
        if (a.origin !== window.location.origin || a.hasAttribute("download") || a.getAttribute("target") === "_blank") return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        
        e.preventDefault();
        push(a.pathname + a.search + a.hash);
      });
    }
  }
  
  const fallback = options?.fallback || null;
  const cases = Array.isArray(routes) ? routes : [];
  
  return Switch(cases, fallback);
}

export function useRouter() {
  return {
    get path() {
      return currentPath.value;
    },
    push,
    replace
  };
}
