import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ConnectionProps {
    /**
     * Name of the connection (1-32 chars). If omitted a deterministic
     * physical name is generated. Changing the name replaces the connection.
     */
    connectionName?: string;
    /**
     * Source-provider the connection authenticates against. Changing the
     * provider replaces the connection.
     */
    providerType: "GitHub" | "GitHubEnterpriseServer" | "Bitbucket" | "GitLab" | "GitLabSelfManaged";
    /**
     * ARN of a CodeConnections `Host` (required for self-managed providers
     * such as `GitHubEnterpriseServer` / `GitLabSelfManaged`).
     */
    hostArn?: string;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface Connection extends Resource<"AWS.CodeConnections.Connection", ConnectionProps, {
    /** Physical name of the connection. */
    connectionName: string;
    /** ARN of the connection (referenced by CodePipeline source actions). */
    connectionArn: string;
    /**
     * Connection state. A freshly created connection is `PENDING` until the
     * OAuth handshake is completed manually in the AWS console; it then
     * becomes `AVAILABLE`.
     */
    connectionStatus: string;
    /** The source provider (`GitHub`, `GitLab`, `Bitbucket`, ...). */
    providerType: string;
}, never, Providers> {
}
/**
 * An AWS CodeConnections connection to a source-code provider (GitHub,
 * GitLab, Bitbucket).
 *
 * A connection is created in the `PENDING` state. Completing it requires a
 * one-time OAuth handshake performed **manually** in the AWS console (the
 * "Update pending connection" flow) — there is no API to finish the
 * handshake. Once completed the connection becomes `AVAILABLE` and can be
 * referenced by a CodePipeline `CodeStarSourceConnection` action.
 * ### Creating a Connection
 * **Example:** GitHub Connection (created PENDING)
 * ```typescript
 * const connection = yield* CodeConnections.Connection("GitHub", {
 *   providerType: "GitHub",
 * });
 * // connection.connectionStatus === "PENDING"
 * // Complete the handshake in the console before using it in a pipeline.
 * ```
 *
 * @resource
 */
export declare const Connection: import("../../Resource.ts").ResourceClass<Connection>;
export declare const ConnectionProvider: () => import("effect/Layer").Layer<Provider.Provider<Connection>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Connection.d.ts.map