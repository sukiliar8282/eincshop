import * as Effect from "effect/Effect";
import type { Cluster } from "./Cluster.ts";
/**
 * Shared scaffolding for the DAX connect bindings.
 *
 * NOT exported from `index.ts` — `ConnectReadHttp.ts` / `ConnectWriteHttp.ts`
 * / `ConnectReadWriteHttp.ts` are thin
 * `Layer.effect(Cap, makeDaxConnectHttpBinding({ … }))` calls over the
 * builder below. Only the IAM action list differs per access level.
 */
/**
 * Protocol actions every DAX client needs regardless of access level — the
 * client discovers cluster nodes and negotiates the item schema before any
 * item operation.
 */
export declare const DAX_PROTOCOL_ACTIONS: readonly ["dax:DefineAttributeList", "dax:DefineAttributeListId", "dax:DefineKeySchema", "dax:Endpoints"];
/** Read-side DAX data-plane actions. */
export declare const DAX_READ_ACTIONS: readonly ["dax:GetItem", "dax:BatchGetItem", "dax:Query", "dax:Scan"];
/** Write-side DAX data-plane actions. */
export declare const DAX_WRITE_ACTIONS: readonly ["dax:PutItem", "dax:UpdateItem", "dax:DeleteItem", "dax:BatchWriteItem", "dax:ConditionCheckItem"];
/**
 * Build the impl Effect for a connect binding. At deploy time it grants
 * `actions` on the cluster ARN and publishes the discovery endpoint as
 * `DAX_{LOGICAL_ID}_{HOST,PORT,URL,TLS}` environment variables on the host
 * Function; at runtime it resolves the same values into a typed connection
 * descriptor.
 */
export declare const makeDaxConnectHttpBinding: (options: {
    /** Fully-qualified binding tag, e.g. `AWS.DAX.ConnectReadWrite`. */
    tag: string;
    /** IAM actions granted on the cluster ARN. */
    actions: readonly string[];
}) => Effect.Effect<(cluster: Cluster) => Effect.Effect<Effect.Effect<{
    host: string;
    port: number;
    url: string;
    tls: boolean;
}, never, never>, never, never>, never, never>;
//# sourceMappingURL=ConnectHttp.d.ts.map