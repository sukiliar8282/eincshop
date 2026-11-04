import * as Effect from "effect/Effect";
import type { Namespace } from "./Namespace.ts";
/**
 * Shared scaffolding for Amazon Redshift Serverless HTTP bindings.
 *
 * NOT exported from `index.ts` — every snapshot/recovery-point/restore
 * `{Op}Http.ts` in this service is a thin
 * `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the identifier resolver, and the
 * IAM action list is boilerplate. (`ConnectHttp` stays bespoke — it also
 * publishes endpoint environment variables and formats connection URLs.)
 */
/**
 * Build the impl Effect for an account-level operation (snapshot
 * administration, recovery-point reads, table-restore status). The
 * deploy-time half grants `actions` on `*` — these operations span every
 * namespace in the account and the identifiers they filter on are runtime
 * data.
 */
export declare const makeServerlessAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.RedshiftServerless.GetSnapshot`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a namespace-scoped operation: the runtime
 * callable injects the bound {@link Namespace}'s name as `namespaceName`
 * and the deploy-time half grants `actions` on the namespace ARN (plus any
 * `extraResources`, e.g. the `snapshot/*` or `recoverypoint/*` ARN patterns
 * that snapshot creation and restores also authorize against).
 */
export declare const makeServerlessNamespaceHttpBinding: <I extends {
    namespaceName?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.RedshiftServerless.CreateSnapshot`. */
    tag: string;
    /** The distilled operation; `namespaceName` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the namespace ARN. */
    actions: readonly string[];
    /** Additional IAM resource ARNs derived from the namespace ARN. */
    extraResources?: (namespaceArn: string) => string[];
}) => Effect.Effect<(namespace: Namespace) => Effect.Effect<(request: Omit<I, "namespaceName">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * The `arn:…:{account}` prefix of a Redshift Serverless resource ARN —
 * used to widen a namespace grant to sibling resource types (`snapshot/*`,
 * `recoverypoint/*`, `workgroup/*`) that snapshot and restore operations
 * also authorize against.
 */
export declare const serverlessArnPrefix: (arn: string) => string;
//# sourceMappingURL=BindingHttp.d.ts.map