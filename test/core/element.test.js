import { describe, test, expect, vi } from "vitest";
import { defineElement, html, effect } from "../../gui/index.js";

describe("defineElement", () => {
  test("mounts as custom element and registers attributes", async () => {
    let effectRanTimes = 0;
    let cleanupRan = false;

    defineElement("gui-button-test", (props) => {
      effect(() => {
        // Track the prop value
        console.log("Tracking name:", props.name);
        effectRanTimes++;
        return () => { cleanupRan = true; };
      });
      return html`<button>Click ${() => props.name}</button>`;
    }, { attributes: ["name"] });

    const el = document.createElement("gui-button-test");
    // Seed initial attribute
    el.setAttribute("name", "World");
    
    // connectedCallback runs here
    document.body.appendChild(el);
    
    // Happy-dom syncs up microtasks automatically? Typically we wait.
    await Promise.resolve();

    expect(el.shadowRoot).toBeTruthy();
    const btn = el.shadowRoot.querySelector("button");
    expect(btn.textContent).toBe("Click World");
    expect(effectRanTimes).toBe(1);

    // Attribute change triggers reactivity
    el.setAttribute("name", "gUI");
    await Promise.resolve();
    expect(btn.textContent).toBe("Click gUI");
    expect(effectRanTimes).toBe(2);

    // Direct property change triggers reactivity
    el.name = "Universe";
    await Promise.resolve();
    expect(btn.textContent).toBe("Click Universe");
    expect(effectRanTimes).toBe(3);

    // Disconnect should run cleanup
    document.body.removeChild(el);
    expect(cleanupRan).toBe(true);
  });

  test("runs in light DOM if shadow is false", async () => {
    defineElement("gui-light-test", (props) => {
      return html`<p>Light DOM ${() => props.msg}</p>`;
    }, { shadow: false, attributes: ["msg"] });

    const el = document.createElement("gui-light-test");
    el.setAttribute("msg", "mode");
    document.body.appendChild(el);

    expect(el.shadowRoot).toBeNull();
    const p = el.querySelector("p");
    expect(p.textContent).toBe("Light DOM mode");
  });
});
