import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { Router, Route, push, replace, useRouter } from "../../gui/composition/router.js";
import { effect } from "../../gui/reactivity/effect.js";

describe("Router", () => {
  beforeEach(() => {
    // Reset hash for clean slate
    window.location.hash = "";
  });

  test("matches hash route and renders correctly", async () => {
    let rendered = "";

    const App = Router({ mode: "hash", fallback: () => "404" }, [
      Route({ path: "/" }, () => "Home"),
      Route({ path: "/about" }, () => "About"),
      Route({ path: "/user/:id" }, (params) => `User ${params.id}`)
    ]);

    effect(() => {
      rendered = App(); // evaluate the router render closure
    });

    // Default should resolve to '/' if no hash
    expect(rendered).toBe("Home");

    // Push new route
    push("/about");
    await Promise.resolve(); // scheduler queue
    expect(rendered).toBe("About");

    // Dynamic param route
    push("/user/123");
    await Promise.resolve();
    expect(rendered).toBe("User 123");

    // Fallback
    push("/unknown");
    await Promise.resolve();
    expect(rendered).toBe("404");
  });

  test("useRouter exposes current path", async () => {
    const router = useRouter();
    let current = "";
    
    effect(() => {
      current = router.path;
    });

    push("/test");
    await Promise.resolve();
    expect(current).toBe("/test");
  });

  test("supports wildcard route", async () => {
    let rendered = "";

    const App = Router({ mode: "hash" }, [
      Route({ path: "/foo" }, () => "Foo"),
      Route({ path: "*" }, () => "Wildcard")
    ]);

    effect(() => { rendered = App(); });

    push("/random/path/here");
    await Promise.resolve();
    
    expect(rendered).toBe("Wildcard");
  });
});
