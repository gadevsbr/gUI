import { mount } from "./mount.js";
import { createStore } from "../reactivity/store.js";

export function defineElement(tag, setup, options = {}) {
  class GuiElement extends HTMLElement {
    constructor() {
      super();
      this._store = createStore({});
      this._mountHandle = null;
      
      if (options.shadow !== false) {
        this.attachShadow({ mode: options.shadowMode || "open" });
      }
    }

    static get observedAttributes() {
      return options.attributes || [];
    }

    attributeChangedCallback(name, oldV, newV) {
      if (oldV !== newV) {
        this._store[name] = newV;
      }
    }

    connectedCallback() {
      if (this._mountHandle) return;

      // Seed initial string attributes
      for (const attr of (options.attributes || [])) {
        if (this.hasAttribute(attr)) {
          this._store[attr] = this.getAttribute(attr);
        }
      }

      const root = options.shadow === false ? this : this.shadowRoot;
      const componentTree = setup(this._store, this); // passes store and host
      this._mountHandle = mount(root, componentTree);
    }

    disconnectedCallback() {
      if (this._mountHandle) {
        this._mountHandle.unmount();
        this._mountHandle = null;
      }
    }
  }

  // Create getters/setters for attributes so direct JS property access pushes to store
  for (const attr of (options.attributes || [])) {
    Object.defineProperty(GuiElement.prototype, attr, {
      enumerable: true,
      get() {
        return this._store[attr];
      },
      set(val) {
        this._store[attr] = val;
        // Optionally mirror back to HTML attribute if it's a string/number?
        // Let's avoid that to prevent circular calls or complex serialization.
        // Direct property set is enough for complex reactivity.
      }
    });
  }

  customElements.define(tag, GuiElement);
}
