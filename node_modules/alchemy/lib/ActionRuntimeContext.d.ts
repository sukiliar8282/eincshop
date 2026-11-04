import type { Output } from "./Output.ts";
import { type BaseRuntimeContext } from "./RuntimeContext.ts";
/**
 * Capture context — provided while an Action's init Effect runs. Records every
 * Output referenced via `yield* output` into `captures`, keyed by the Output's
 * sanitized key, and returns deferred accessors.
 */
export declare const makeCaptureContext: (captures: Record<string, Output>) => BaseRuntimeContext;
/**
 * Resolve context — provided around an Action body at apply time. `resolved`
 * maps each captured key to its value (already evaluated against the tracker).
 */
export declare const makeResolveContext: (resolved: Record<string, unknown>) => BaseRuntimeContext;
//# sourceMappingURL=ActionRuntimeContext.d.ts.map