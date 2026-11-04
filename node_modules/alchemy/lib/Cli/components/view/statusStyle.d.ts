/**
 * The one mapping from plan actions / apply statuses to brand colors and
 * icons — shared by the plan tree, the live progress view, and the plain
 * logging CLI so an action never renders two different hues.
 */
import type { ApplyStatus } from "../../../Report.ts";
import { type GlyphName } from "../../CliKit/index.ts";
/** Every verb a plan row can carry (resource CRUD + namespace/action rollups). */
export type PlanAction = "create" | "update" | "adopted" | "delete" | "orphaned" | "replace" | "noop" | "mixed" | "run";
export declare const actionStyle: Record<PlanAction, {
    readonly color: string;
    readonly icon: GlyphName;
}>;
export declare const applyStatusColor: (status: ApplyStatus | "no change") => string | undefined;
/** Settled states — the row will not change again. */
export declare const isTerminalStatus: (status: ApplyStatus) => boolean;
export declare const isInProgress: (status: ApplyStatus) => boolean;
//# sourceMappingURL=statusStyle.d.ts.map