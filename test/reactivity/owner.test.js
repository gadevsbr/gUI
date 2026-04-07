import { describe, it, expect, vi } from "vitest";
import {
  createOwner,
  disposeOwner,
  withOwner,
  getCurrentOwner,
  registerDisposable,
} from "../../gui/reactivity/dependencyGraph.js";

describe("ownership system", () => {
  describe("createOwner()", () => {
    it("cria um owner com id e label", () => {
      const owner = createOwner("teste");
      expect(owner.id).toMatch(/^owner:\d+/);
      expect(owner.label).toBe("teste");
      expect(owner.disposed).toBe(false);
    });

    it("cria hierarquia pai→filho quando há owner ativo", () => {
      const parent = createOwner("pai");
      let child;

      withOwner(parent, () => {
        child = createOwner("filho");
      });

      expect(parent.children.has(child)).toBe(true);
      expect(child.parent).toBe(parent);
    });

    it("owner sem parent ativo tem parent null", () => {
      // Garante que não há owner ativo no contexto do teste
      const owner = withOwner(null, () => createOwner("sem-pai"));
      expect(owner.parent).toBeNull();
    });
  });

  describe("withOwner()", () => {
    it("restaura o owner anterior após execução", () => {
      const parent = createOwner("pai");
      const child = createOwner("filho");

      withOwner(parent, () => {
        expect(getCurrentOwner()).toBe(parent);
        withOwner(child, () => {
          expect(getCurrentOwner()).toBe(child);
        });
        expect(getCurrentOwner()).toBe(parent);
      });
    });

    it("restaura o owner mesmo se a callback lança erro", () => {
      const owner = createOwner("owner");

      expect(() => {
        withOwner(owner, () => {
          throw new Error("erro");
        });
      }).toThrow("erro");

      // Após o erro, o owner ativo deve ter sido restaurado
      // (não deve ser o owner que foi passado)
      expect(getCurrentOwner()).not.toBe(owner);
    });

    it("retorna o valor da callback", () => {
      const result = withOwner(null, () => 42);
      expect(result).toBe(42);
    });
  });

  describe("registerDisposable()", () => {
    it("registra cleanup que é chamado ao dispor o owner", () => {
      const cleanup = vi.fn();
      const owner = createOwner("owner");

      withOwner(owner, () => {
        registerDisposable(cleanup);
      });

      expect(cleanup).not.toHaveBeenCalled();
      disposeOwner(owner);
      expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it("retorna função que remove o cleanup do owner", () => {
      const cleanup = vi.fn();
      const owner = createOwner("owner");

      let remove;
      withOwner(owner, () => {
        remove = registerDisposable(cleanup);
      });

      remove(); // desregistra
      disposeOwner(owner);
      expect(cleanup).not.toHaveBeenCalled();
    });

    it("ignora quando não há owner ativo", () => {
      // Não deve lançar
      withOwner(null, () => {
        expect(() => registerDisposable(() => {})).not.toThrow();
      });
    });
  });

  describe("disposeOwner()", () => {
    it("marca o owner como disposed", () => {
      const owner = createOwner("owner");
      disposeOwner(owner);
      expect(owner.disposed).toBe(true);
    });

    it("faz dispose em cascata dos filhos", () => {
      const parent = createOwner("pai");
      let child;
      withOwner(parent, () => {
        child = createOwner("filho");
      });

      disposeOwner(parent);

      expect(parent.disposed).toBe(true);
      expect(child.disposed).toBe(true);
    });

    it("executa todos os disposables registrados", () => {
      const fns = [vi.fn(), vi.fn(), vi.fn()];
      const owner = createOwner("owner");

      withOwner(owner, () => {
        for (const fn of fns) {
          registerDisposable(fn);
        }
      });

      disposeOwner(owner);

      for (const fn of fns) {
        expect(fn).toHaveBeenCalledTimes(1);
      }
    });

    it("remove o filho da lista do pai ao fazer dispose", () => {
      const parent = createOwner("pai");
      let child;
      withOwner(parent, () => {
        child = createOwner("filho");
      });

      disposeOwner(child);

      expect(parent.children.has(child)).toBe(false);
    });

    it("é idempotente: segunda chamada não faz nada", () => {
      const cleanup = vi.fn();
      const owner = createOwner("owner");
      withOwner(owner, () => registerDisposable(cleanup));

      disposeOwner(owner);
      disposeOwner(owner); // segunda vez

      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });
});
