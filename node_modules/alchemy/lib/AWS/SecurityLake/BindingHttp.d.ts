import * as Effect from "effect/Effect";
import type { DataLake } from "./DataLake.ts";
/**
 * Shared scaffolding for Amazon Security Lake HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeSecurityLakeDataLakeHttpBinding({ … }))` over the
 * builder below. Everything except the operation and the IAM action list is
 * boilerplate.
 */
/**
 * Build the impl Effect for a Security Lake operation scoped to the account's
 * {@link DataLake}: the deploy-time half grants `actions` on the bound data
 * lake's ARN, and the runtime half invokes the operation with the caller's
 * request as-is (Security Lake's monitoring operations take no resource
 * parameter — the data lake is implicit in the account/Region).
 */
export declare const makeSecurityLakeDataLakeHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SecurityLake.GetDataLakeSources`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the data lake ARN. */
    actions: readonly string[];
}) => Effect.Effect<(lake: DataLake) => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map