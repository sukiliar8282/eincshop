import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface KeyspaceProps {
    /**
     * Name of the keyspace. Must be 1-48 characters of `[a-zA-Z0-9_]`. If
     * omitted a deterministic physical name is generated. Changing the name
     * replaces the keyspace.
     */
    keyspaceName?: string;
    /**
     * User-defined tags for the keyspace.
     */
    tags?: Record<string, string>;
}
export interface Keyspace extends Resource<"AWS.Keyspaces.Keyspace", KeyspaceProps, {
    /**
     * The keyspace's physical name.
     */
    keyspaceName: string;
    /**
     * ARN of the keyspace.
     */
    keyspaceArn: string;
    /**
     * Replication strategy of the keyspace (`SINGLE_REGION` or
     * `MULTI_REGION`).
     */
    replicationStrategy: string;
}, never, Providers> {
}
/**
 * An Amazon Keyspaces (for Apache Cassandra) keyspace — the top-level
 * container for Cassandra tables.
 *
 * Keyspaces are serverless, free to create, and provisioned near-instantly,
 * so they make excellent building blocks and test fixtures.
 * ### Creating a Keyspace
 * **Example:** Basic Keyspace
 * ```typescript
 * const keyspace = yield* Keyspace("AppData", {});
 * ```
 *
 * **Example:** Named Keyspace with Tags
 * ```typescript
 * const keyspace = yield* Keyspace("AppData", {
 *   keyspaceName: "app_data",
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * @resource
 */
export declare const Keyspace: import("../../Resource.ts").ResourceClass<Keyspace>;
export declare const KeyspaceProvider: () => import("effect/Layer").Layer<Provider.Provider<Keyspace>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Keyspace.d.ts.map