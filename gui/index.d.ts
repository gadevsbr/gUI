export interface ReactiveNodeSnapshot {
  id: string;
  kind: string;
  label?: string;
  version: number;
  dirty: boolean;
  initialized: boolean;
  sourceCount: number;
  subscriberCount: number;
}

export interface Signal<T> {
  value: T;
  set(nextValue: T): T;
  update(updater: (current: T) => T): T;
  peek(): T;
  inspect(): ReactiveNodeSnapshot;
}

export interface Computed<T> {
  readonly value: T;
  peek(): T;
  inspect(): ReactiveNodeSnapshot;
  dispose(): void;
}

export interface EffectHandle {
  (): void;
  inspect(): ReactiveNodeSnapshot;
}

export interface TemplateResult {
  readonly fragment: DocumentFragment;
  readonly nodes: Node[];
  dispose(): void;
}

export interface MountHandle {
  container: Element | Node;
  nodes: Node[];
  unmount(): void;
}

export interface AppHandle {
  owner: unknown;
  target: Element | Node;
  unmount(): void;
}

export function batch<T>(fn: () => T): T;

export function createStore<T extends object>(initialValue: T): T;
export function unwrapStore<T extends object>(proxy: T): T;

export interface Resource<T> {
  readonly value: T | undefined;
  readonly loading: boolean;
  readonly error: unknown;
  refetch(): Promise<T>;
}

export function createResource<T, S = unknown>(
  source: S | (() => S) | Signal<S> | Computed<S>,
  fetcher: (source: S) => Promise<T>,
  options?: { initialValue?: T }
): Resource<T>;

export function createResource<T>(
  fetcher: () => Promise<T>,
  options?: { initialValue?: T }
): Resource<T>;

export interface Context<T> {
  id: string;
  label: string;
  defaultValue: T;
  Provider(value: T, render: (() => unknown) | unknown): TemplateResult;
}

export function on<T = string>(
  signal: Signal<T> | ((value: T) => void),
  transform?: (value: string) => T
): (event: Event) => void;

export interface RouteDefinition {
  path: string;
  children: ((params: Record<string, string>) => unknown) | unknown;
}

export function Route(options: { path: string }, children: ((params: Record<string, string>) => unknown) | unknown): MatchCase;

export function Router(
  options: { mode?: "hash" | "history", fallback?: (() => unknown) | unknown },
  routes: RouteDefinition[]
): () => unknown;

export function push(path: string): void;
export function replace(path: string): void;
export function useRouter(): { readonly path: string; push: typeof push; replace: typeof replace };

export interface MatchCase<T = unknown> {
  when: T | Signal<T> | Computed<T> | (() => T);
  children: ((value: T) => unknown) | unknown;
}

export interface DomUpdateSourceSummary {
  id: string;
  kind: string;
  label: string;
}

export interface DomUpdateOwnerSummary {
  id: string;
  label: string;
}

export interface DomUpdateOriginSummary {
  id: string;
  kind: string;
  label?: string;
  version: number;
  dirty: boolean;
  initialized: boolean;
  sourceCount: number;
  subscriberCount: number;
  owner: DomUpdateOwnerSummary | null;
  sources: DomUpdateSourceSummary[];
}

export interface DomUpdateEvent {
  type: "text" | "attribute" | "structure";
  timestamp: number;
  origin: DomUpdateOriginSummary | null;
  node?: Node;
  element?: Element;
  name?: string;
  value?: unknown;
  action?: "insert" | "move" | "remove";
  anchor?: Node;
  rect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  } | null;
}

export interface ListBinding<T> {
  readonly source: T[] | Signal<T[]> | Computed<T[]> | (() => T[]);
}

export declare function signal<T>(initialValue: T, options?: { label?: string }): Signal<T>;

export declare function createContext<T>(defaultValue: T, options?: { label?: string }): Context<T>;

export declare function provideContext<T>(
  context: Context<T>,
  value: T,
  render: (() => unknown) | unknown,
): TemplateResult;

export declare function useContext<T>(context: Context<T>): T;

export function mergeProps<T extends Record<string, any>>(...sources: (Partial<T> | undefined | null)[]): T;
export function splitProps<T extends Record<string, any>, K extends (keyof T)[]>(
  props: T,
  ...keysets: [...K[]]
): [...Record<string, any>[], Record<string, any>];

export declare function computed<T>(
  compute: () => T,
  options?: { label?: string },
): Computed<T>;

export declare function effect(run: () => void | (() => void), options?: { label?: string }): EffectHandle;

export declare function html(
  strings: TemplateStringsArray,
  ...values: unknown[]
): TemplateResult;

export declare function isTemplateResult(value: unknown): value is TemplateResult;

export declare function Show<T>(options: {
  when: T | Signal<T> | Computed<T> | (() => T);
  children: ((value: T) => unknown) | unknown;
  fallback?: ((value: T) => unknown) | unknown;
}): () => unknown;

export declare function Match<T>(options: MatchCase<T>): MatchCase<T>;

export declare function Switch<T>(
  source:
    | MatchCase<T>[]
    | {
        cases?: MatchCase<T>[];
        children?: MatchCase<T>[];
        fallback?: (() => unknown) | unknown;
      },
  fallback?: (() => unknown) | unknown,
): () => unknown;

export declare function list<T>(
  source: T[] | Signal<T[]> | Computed<T[]> | (() => T[]),
  key: ((item: T, index: number) => unknown) | keyof T,
  render: (item: Signal<T>, index: Signal<number>, key: unknown) => unknown,
  options?: { label?: string },
): ListBinding<T>;

export declare function Portal(
  target: string | Element | DocumentFragment | (() => string | Element | DocumentFragment | null) | Signal<string | Element | DocumentFragment | null> | Computed<string | Element | DocumentFragment | null>,
  children: (() => unknown) | unknown,
  options?: { label?: string },
): TemplateResult;

export function mount(target: Element | string, value: unknown): MountHandle;

export interface ElementOptions {
  shadow?: boolean;
  shadowMode?: "open" | "closed";
  attributes?: string[];
}

export function defineElement(
  tag: string,
  setup: (props: Record<string, any>, host: HTMLElement) => unknown,
  options?: ElementOptions
): void;

export declare function createApp(
  target: string | Node,
  component: (() => unknown) | unknown,
): AppHandle;

export declare function setDomUpdateHook(
  hook: ((payload: DomUpdateEvent) => void) | null,
): void;

export declare function subscribeDomUpdates(listener: (payload: DomUpdateEvent) => void): () => void;
