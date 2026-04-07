import { describe, it, expect } from "vitest";
import { createContext, provideContext, useContext } from "../../gui/composition/context.js";
import { createOwner, disposeOwner, withOwner } from "../../gui/reactivity/dependencyGraph.js";
import { html, toTemplateNodes } from "../../gui/rendering/html.js";

describe("Context API", () => {
  it("useContext retorna defaultValue se não houver context injection na árvore", () => {
    const ThemeContext = createContext("light", { label: "Theme" });
    
    // Sem prover o value
    const v = useContext(ThemeContext);
    expect(v).toBe("light");
  });

  it("useContext retorna undefined se não achar context e sem defaultValue", () => {
    const UserCtx = createContext(); 
    const v = useContext(UserCtx);
    expect(v).toBeUndefined();
  });

  it("provideContext e useContext funcionam perfeitamente na hierarquia root", () => {
    const DataCtx = createContext("empty");

    const OwnerRoot = createOwner("root");
    let receivedValue;

    withOwner(OwnerRoot, () => {
      // provideContext returns a result that must be placed in tree (ou executado)
      // Como o context armazena no 'owner' de providerOwner
      provideContext(DataCtx, "full", () => {
        receivedValue = useContext(DataCtx);
      });
    });

    expect(receivedValue).toBe("full");
  });

  it("contexto lido no children component acessa o value injetado mais acima", () => {
    const ThemeCtx = createContext("dark");

    const App = () => {
       return ThemeCtx.Provider("purple", () => {
         return Child();
       });
    };

    const Child = () => {
      const color = useContext(ThemeCtx);
      return html`<div>${color}</div>`;
    };

    const OwnerApp = createOwner("app");
    let resultView;

    withOwner(OwnerApp, () => {
      resultView = App();
    });

    const div = toTemplateNodes(resultView)[0];
    expect(div.textContent).toBe("purple");
  });

  it("context values can be signal and read reactively", () => {
     // Apenas confirmando o fluxo de que passamos uma referencia normal (objeto signal), então continua funcionando perfeitamente sem wrappers magicos.
     const MyCtx = createContext({ v: 1 });
     
     let received = null;
     const OwnerRoot = createOwner("root");
     withOwner(OwnerRoot, () => {
       provideContext(MyCtx, { v: 99 }, () => {
         received = useContext(MyCtx);
       });
     });
     
     expect(received.v).toBe(99);
  });
});
