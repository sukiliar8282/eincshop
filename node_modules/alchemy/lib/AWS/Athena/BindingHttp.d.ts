import * as Effect from "effect/Effect";
import type { DataCatalog } from "./DataCatalog.ts";
import type { WorkGroup } from "./WorkGroup.ts";
/**
 * Shared scaffolding for Athena HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two builders
 * below. Everything except the operation, the IAM action list, and the
 * injected identifier is boilerplate.
 */
/**
 * Build the impl Effect for a workgroup-scoped query operation. Athena
 * authorizes query-execution actions against the workgroup the query ran in,
 * so the deploy-time half grants `actions` on the bound {@link WorkGroup}'s
 * ARN. When `injectWorkGroup` is set, the runtime callable also injects the
 * workgroup's name as the request's `WorkGroup` field (for operations like
 * `ListQueryExecutions` that scope by workgroup in the request itself).
 */
export declare const makeWorkGroupScopedHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Athena.GetQueryExecution`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the workgroup ARN. */
    actions: readonly string[];
    /** Inject the bound workgroup's name as the request `WorkGroup` field. */
    injectWorkGroup?: boolean;
}) => Effect.Effect<(workGroup: WorkGroup) => Effect.Effect<(request: Omit<I, "WorkGroup">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a catalog-metadata operation. The runtime callable
 * injects the bound {@link DataCatalog}'s name as `CatalogName`; the
 * deploy-time half grants `actions` on the datacatalog ARN plus the Glue
 * Data Catalog reads Athena performs on the caller's behalf when the catalog
 * resolves through Glue.
 */
export declare const makeDataCatalogScopedHttpBinding: <I extends {
    CatalogName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Athena.GetDatabase`. */
    tag: string;
    /** The distilled operation; `CatalogName` is injected from the resource. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the datacatalog ARN. */
    actions: readonly string[];
}) => Effect.Effect<(catalog: DataCatalog) => Effect.Effect<(request: Omit<I, "CatalogName">) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map