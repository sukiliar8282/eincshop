import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RepositoryLinkProps {
    /**
     * ARN of the connection to the external provider. The connection must be
     * in the `AVAILABLE` state (its OAuth handshake completed in the console).
     */
    connectionArn: string;
    /**
     * Owner ID of the repository — the GitHub organization/user or GitLab
     * group/user that owns the repository. Changing the owner replaces the
     * link.
     */
    ownerId: string;
    /**
     * Name of the repository to link. Changing the repository replaces the
     * link.
     */
    repositoryName: string;
    /**
     * ARN of the KMS key used to encrypt the repository link's sync content.
     */
    encryptionKeyArn?: string;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface RepositoryLink extends Resource<"AWS.CodeConnections.RepositoryLink", RepositoryLinkProps, {
    /** Unique ID of the repository link (used by sync operations). */
    repositoryLinkId: string;
    /** ARN of the repository link. */
    repositoryLinkArn: string;
    /** ARN of the connection the link authenticates through. */
    connectionArn: string;
    /** Owner ID of the linked repository. */
    ownerId: string;
    /** Name of the linked repository. */
    repositoryName: string;
    /** The source provider (`GitHub`, `GitLab`, ...). */
    providerType: string;
    /** ARN of the KMS key encrypting the link's sync content, if any. */
    encryptionKeyArn: string | undefined;
}, never, Providers> {
}
/**
 * An AWS CodeConnections repository link — associates a connection with a
 * specific external Git repository so Git sync can monitor and sync changes
 * (e.g. CloudFormation git sync).
 *
 * Requires a connection in the `AVAILABLE` state; the connection's OAuth
 * handshake is a one-time **manual** console step.
 * ### Linking a Repository
 * **Example:** Link a GitHub Repository
 * ```typescript
 * const link = yield* CodeConnections.RepositoryLink("Repo", {
 *   connectionArn: connection.connectionArn,
 *   ownerId: "my-github-org",
 *   repositoryName: "my-repo",
 * });
 * ```
 *
 * **Example:** Encrypted Repository Link
 * ```typescript
 * const link = yield* CodeConnections.RepositoryLink("Repo", {
 *   connectionArn: connection.connectionArn,
 *   ownerId: "my-github-org",
 *   repositoryName: "my-repo",
 *   encryptionKeyArn: key.keyArn,
 * });
 * ```
 *
 * @resource
 */
export declare const RepositoryLink: import("../../Resource.ts").ResourceClass<RepositoryLink>;
export declare const RepositoryLinkProvider: () => import("effect/Layer").Layer<Provider.Provider<RepositoryLink>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=RepositoryLink.d.ts.map