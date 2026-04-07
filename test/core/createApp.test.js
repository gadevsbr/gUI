import { describe, it, expect } from "vitest";
import { createApp } from "../../gui/core/createApp.js";

describe("createApp()", () => {
  it("executa component root e o monta no target", () => {
    const div = document.createElement("div");
    div.id = "root";
    document.body.appendChild(div);

    function MyComp() {
      const p = document.createElement("p");
      p.textContent = "hello";
      return p;
    }

    const app = createApp("#root", MyComp);
    expect(app.target).toBe(div);
    expect(div.firstChild.textContent).toBe("hello");
    expect(app.owner.label).toBe("app");
  });

  it("tbm suporta component como node direto", () => {
    const root = document.createElement("div");
    const p = document.createElement("p");
    
    const app = createApp(root, p);
    expect(root.firstChild).toBe(p);
    
    app.unmount();
    expect(root.childNodes.length).toBe(0);
    expect(app.owner.disposed).toBe(true);
  });
});
