import { type PlanRow, type PlanTree, type PlanTreeState, type PlanView } from "./PlanTree.ts";
export type VirtualPlanLine = {
    readonly kind: "row";
    readonly row: PlanRow;
} | {
    readonly kind: "yaml";
    readonly key: string;
    readonly line: string;
    readonly paddingLeft: number;
} | {
    readonly kind: "note";
    readonly key: string;
    readonly paddingLeft: number;
};
export interface PlanWindow {
    readonly selectedView: PlanView;
    readonly hasOutput: boolean;
    readonly virtual: boolean;
    readonly budget: number;
    readonly offset: number;
    readonly hiddenBelow: number;
    readonly planLines: readonly VirtualPlanLine[] | undefined;
}
export declare const usePlanViewport: (options: {
    readonly tree: PlanTree;
    readonly state: PlanTreeState;
    readonly lineBudget: number;
    readonly collapsible: boolean;
    readonly collapsed: boolean;
}) => PlanWindow;
//# sourceMappingURL=usePlanViewport.d.ts.map