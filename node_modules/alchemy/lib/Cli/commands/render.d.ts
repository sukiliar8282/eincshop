import * as Effect from "effect/Effect";
import type { Plan } from "../../Plan.ts";
import * as Report from "../../Report.ts";
import { CliKit } from "../CliKit/CliKit.ts";
export declare const renderPlanning: (options: {
    operation: string;
    stage: string;
    computingLabel?: string;
    readyLabel?: string;
}) => <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, Report.Cli | CliKit | Exclude<R, never>>;
export declare const renderApply: (plan: Plan, options?: Report.PlanDisplayOptions) => <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, Report.Cli | Exclude<R, never>>;
//# sourceMappingURL=render.d.ts.map