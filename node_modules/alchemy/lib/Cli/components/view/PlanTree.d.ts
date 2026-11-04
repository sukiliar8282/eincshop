import type { CRUD, Plan } from "../../../Plan.ts";
import type { ApplyEvent, ResourceStatusChanged } from "../../../Report.ts";
import type { ProviderMode } from "../../../ProviderMode.ts";
import { type ActionVerb, type FlattenedItem, type PlanSummaryCounts } from "../../NamespaceTree.ts";
import type { DeclaredPropertyYaml } from "../../PropertyDiff.ts";
export type PlanRow = {
    key: string;
    type: "namespace";
    id: string;
    depth: number;
    action: FlattenedItem["action"];
} | {
    key: string;
    type: "resource";
    id: string;
    resourceType: string;
    /** Secondary identity for inventories without logical resource names. */
    detail?: string;
    depth: number;
    action: CRUD["action"];
    persistedApplyStatus?: "created" | "updated";
    providerMode?: ProviderMode;
    fromProviderMode?: ProviderMode;
    propertyYaml?: DeclaredPropertyYaml;
} | {
    key: string;
    type: "binding";
    id: string;
    depth: number;
    action: "create" | "update" | "delete" | "noop";
    /**
     * Row key of the resource that carries this binding. Bindings have no
     * lifecycle of their own — the host provider reconciles them — so the
     * row mirrors the host's apply status instead of tracking its own.
     */
    hostKey: string;
} | {
    key: string;
    type: "task";
    id: string;
    depth: number;
    action: ActionVerb;
};
export type ResourceRow = Extract<PlanRow, {
    type: "resource";
}>;
export interface RowState extends Required<Pick<ResourceStatusChanged, "id" | "status">> {
    key: string;
    message?: string;
    startedAt?: number;
    elapsedMs?: number;
}
export type PlanViewport = "full" | "virtual";
export type PlanView = "plan" | "output";
export type PlanOutcome = "success" | "failure";
export interface PlanProgress {
    readonly completed: number;
    readonly failures: number;
    readonly total: number;
}
export interface PlanTreeState {
    readonly tasks: Map<string, RowState>;
    readonly label: string;
    readonly expanded: boolean;
    readonly viewport: PlanViewport;
    readonly busy: boolean;
    readonly outcome: PlanOutcome | undefined;
    readonly output: unknown;
    readonly view: PlanView;
}
export interface PlanTreeOptions {
    readonly detailed?: boolean;
    readonly mode?: "review" | "apply";
    readonly label?: string;
    readonly titleDetail?: string;
    readonly viewport?: PlanViewport;
    readonly busy?: boolean;
    /**
     * Initial collapse state of a collapsible tree. Dev passes the user's
     * last choice so a hot reload doesn't bring back a widget they hid.
     * @default true
     */
    readonly expanded?: boolean;
}
/** Display-only plans, such as cloud inventories, need no engine state or providers. */
export interface PlanTreeData {
    readonly rows: readonly PlanRow[];
    readonly summary: PlanSummaryCounts;
    readonly defaultMode?: ProviderMode;
}
export declare const initialResourceState: (row: ResourceRow) => RowState;
export declare class PlanTree {
    readonly rows: readonly PlanRow[];
    readonly progressRows: readonly PlanRow[];
    readonly summary: PlanSummaryCounts;
    readonly mode: "review" | "apply";
    readonly detailed: boolean;
    readonly titleDetail?: string;
    readonly defaultMode?: ProviderMode;
    private state;
    private readonly listeners;
    constructor(plan: Plan | PlanTreeData, options?: PlanTreeOptions);
    subscribe(listener: () => void): () => boolean;
    snapshot(): PlanTreeState;
    progress(): PlanProgress;
    setExpanded(expanded: boolean): void;
    setLabel(label: string): void;
    setViewport(viewport: PlanViewport): void;
    setBusy(busy: boolean): void;
    finish(outcome: PlanOutcome, label: string, view?: PlanView): void;
    setOutput(output: unknown): void;
    setView(view: PlanView): void;
    emit(event: ApplyEvent): void;
    private update;
}
//# sourceMappingURL=PlanTree.d.ts.map