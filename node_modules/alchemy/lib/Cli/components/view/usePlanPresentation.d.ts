import { type DOMElement } from "@alchemy.run/sigil";
import type { PlanTree, PlanTreeState } from "./PlanTree.ts";
export declare const usePlanPresentation: (options: {
    readonly tree: PlanTree;
    readonly state: PlanTreeState;
    readonly busy: boolean;
    readonly collapsible: boolean;
    readonly hasFooter: boolean;
}) => {
    readonly progress: {
        readonly completed: number;
        readonly failures: number;
        readonly total: number;
    };
    readonly collapsed: boolean;
    readonly showControls: boolean;
    readonly lineBudget: number;
    readonly refs: {
        readonly beforeRef: import("react").RefObject<DOMElement | null>;
        readonly summaryRef: import("react").RefObject<DOMElement | null>;
        readonly controlsRef: import("react").RefObject<DOMElement | null>;
        readonly afterRef: import("react").RefObject<DOMElement | null>;
    };
};
//# sourceMappingURL=usePlanPresentation.d.ts.map