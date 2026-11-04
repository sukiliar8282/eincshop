import type { BindingAction, CRUD, ActionApply, ActionDelete, Plan } from "../Plan.ts";
import type { ProviderMode } from "../ProviderMode.ts";
import { type DeclaredPropertyYaml } from "./PropertyDiff.ts";
export type ActionTreeItem = ActionApply | ActionDelete;
export type ActionVerb = ActionTreeItem["action"];
/** No-op actions are dependency markers, not work the user needs to review. */
export declare const actionHasPlannedWork: (item: ActionTreeItem) => boolean;
export interface PlanSummaryCounts {
    readonly counts: Record<"create" | "update" | "adopted" | "delete" | "orphaned" | "replace" | "noop", number>;
    readonly taskCounts: Record<"run" | "delete" | "noop", number>;
    readonly bindingChanges: number;
}
/** Count every resource and task, plus binding changes, for the Plan summary. */
export declare const buildPlanSummary: (plan: Plan) => PlanSummaryCounts;
/**
 * A tree node representing a namespace.
 * Resources and tasks live directly inside the namespace where they were
 * created.
 */
export interface TreeNode {
    id: string;
    path: string[];
    children: Map<string, TreeNode>;
    resources: CRUD[];
    actions: ActionTreeItem[];
}
export type DerivedAction = "create" | "update" | "adopted" | "delete" | "orphaned" | "replace" | "noop" | "mixed";
export declare function buildNamespaceTree(items: CRUD[], actions?: ReadonlyArray<ActionTreeItem>): TreeNode;
export interface FlattenedItem {
    type: "namespace" | "resource" | "binding" | "action";
    depth: number;
    id: string;
    path: string[];
    action: CRUD["action"] | BindingAction | DerivedAction | ActionVerb;
    resourceType?: string;
    bindingSid?: string;
    bindingCount?: number;
    hasChildren?: boolean;
    /** For task items, the Task's Type (e.g. "Sync"). */
    actionType?: string;
    /**
     * For resource items, the {@link ProviderMode} the node's provider was
     * resolved for. `undefined` for mode-agnostic providers.
     */
    providerMode?: ProviderMode;
    /**
     * For resource items planned as a mode-switch replacement, the mode the
     * old generation was created with (always differs from `providerMode`).
     */
    fromProviderMode?: ProviderMode;
    /** Safe YAML detail attached only when the caller opts into detailed view. */
    propertyYaml?: DeclaredPropertyYaml;
}
export interface FlattenTreeOptions {
    includePropertyYaml?: boolean;
}
export declare function flattenTree(node: TreeNode, options?: FlattenTreeOptions): FlattenedItem[];
//# sourceMappingURL=NamespaceTree.d.ts.map