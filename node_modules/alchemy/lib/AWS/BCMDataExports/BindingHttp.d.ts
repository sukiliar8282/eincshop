import * as Effect from "effect/Effect";
import type { Export } from "./Export.ts";
/**
 * Shared HTTP scaffolding for the BCM Data Exports runtime bindings.
 *
 * Every capability follows the same shape — resolve the distilled operation,
 * register an IAM policy statement on the binding host, and return a runtime
 * callable. The only variation is the operation, the IAM action(s), and
 * whether the binding is scoped to one {@link Export} (injecting its
 * `ExportArn`) or to the whole account (table-dictionary and list
 * operations, which are not resource-scoped).
 *
 * BCM Data Exports is a global service — its endpoint resolver routes every
 * standard-partition region to the implicit global endpoint, so no region
 * pinning is needed.
 *
 * @internal — not exported from `index.ts`.
 */
/**
 * Build the implementation effect for an export-scoped capability: the
 * runtime callable injects the bound {@link Export}'s ARN as `ExportArn` and
 * the deploy-time half grants `iamActions` on the export ARN.
 */
export declare const makeExportHttpBinding: <I extends {
    ExportArn: string;
}, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"GetExecution"`.
     */
    capability: string;
    /**
     * IAM actions granted on the export ARN, e.g.
     * `["bcm-data-exports:GetExecution"]`.
     */
    iamActions: readonly string[];
    /**
     * The distilled operation; `ExportArn` is injected from the resource.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<(dataExport: Export) => Effect.Effect<(request?: Omit<I, "ExportArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the implementation effect for an account-level capability (no
 * export argument — the table dictionary and list operations). The
 * deploy-time half grants `iamActions` on `*` because these operations are
 * not resource-scoped.
 */
export declare const makeDataExportsAccountHttpBinding: <I extends object, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"ListTables"`.
     */
    capability: string;
    /**
     * IAM actions granted on `Resource: ["*"]`.
     */
    iamActions: readonly string[];
    /**
     * The distilled operation implementing the capability.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map