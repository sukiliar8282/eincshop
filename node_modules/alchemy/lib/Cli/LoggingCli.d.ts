import * as Layer from "effect/Layer";
import * as Prompt from "effect/unstable/cli/Prompt";
import type { Plan } from "../Plan.ts";
import { Cli, type PlanDisplayOptions } from "../Report.ts";
/** Exported for unit tests — pure plan-preview rendering. */
export declare const formatPlanLines: (plan: Plan, options?: PlanDisplayOptions) => string[];
export declare const LoggingCli: Layer.Layer<Cli, never, Prompt.Environment>;
//# sourceMappingURL=LoggingCli.d.ts.map