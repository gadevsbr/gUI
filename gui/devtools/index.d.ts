export interface InspectorSourceSummary {
  id: string;
  kind: string;
  label: string;
}

export interface InspectorOwnerSummary {
  id: string;
  label: string;
}

export interface InspectorOriginSummary {
  id: string;
  kind: string;
  label?: string;
  version: number;
  dirty: boolean;
  initialized: boolean;
  sourceCount: number;
  subscriberCount: number;
  owner: InspectorOwnerSummary | null;
  sources: InspectorSourceSummary[];
}

export interface DomUpdateEvent {
  type: "text" | "attribute" | "structure";
  timestamp: number;
  origin: InspectorOriginSummary | null;
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

export interface RuntimeEventSummary {
  timestamp: number;
  type:
    | "signal:write"
    | "computed:invalidate"
    | "computed:refresh"
    | "subscriber:cleanup"
    | "subscriber:flush"
    | "subscriber:dispose"
    | "owner:dispose";
  node?: InspectorOriginSummary;
  owner?: InspectorOwnerSummary | null;
  valueSummary?: string;
  changed?: boolean;
  durationMs?: number;
  hasCleanup?: boolean;
  childCount?: number;
  disposableCount?: number;
}

export interface InspectorController {
  clear(): void;
  destroy(): void;
  pause(): void;
  resume(): void;
  setExpanded(expanded: boolean): void;
  setTarget(target: null | string | Node | (() => null | string | Node)): void;
  toggleExpanded(): void;
  entries(): Array<{
    tone: string;
    tag: string;
    title: string;
    detail: string;
    meta: string;
  }>;
  isExpanded(): boolean;
  isPaused(): boolean;
}

export interface InspectorOptions {
  title?: string;
  subtitle?: string;
  maxEntries?: number;
  overlayDuration?: number;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  target?: null | string | Node | (() => null | string | Node);
  container?: Element | null;
  paused?: boolean;
  collapsed?: boolean;
  expanded?: boolean;
  overlay?: boolean;
  runtime?: boolean;
  onDestroy?: () => void;
  domEventFilter?: (event: DomUpdateEvent) => boolean;
  runtimeEventFilter?: (event: RuntimeEventSummary) => boolean;
}

export declare function createInspector(options?: InspectorOptions): InspectorController;
