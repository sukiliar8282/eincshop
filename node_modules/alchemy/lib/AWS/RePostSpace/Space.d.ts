import * as repostspace from "@distilled.cloud/aws/repostspace";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SpaceSupportedEmailDomains {
    /**
     * Whether the supported-email-domains feature is enabled for the
     * private re:Post.
     */
    enabled?: "ENABLED" | "DISABLED";
    /**
     * Email domains allowed to join the private re:Post.
     */
    allowedDomains?: string[];
}
export interface SpaceProps {
    /**
     * Display name of the private re:Post. Must be unique within the account.
     * Changing the name replaces the space.
     * @default a deterministic physical name derived from app, stage, and id
     */
    name?: string;
    /**
     * Subdomain the private re:Post is served from
     * (`https://{subdomain}-{random}.private.repost.aws`). Must be globally
     * unique across AWS re:Post Private. Changing the subdomain replaces the
     * space.
     * @default a deterministic lowercase physical name derived from app, stage, and id
     */
    subdomain?: string;
    /**
     * Pricing tier of the private re:Post — `"BASIC"` or `"STANDARD"`.
     * Updated in place.
     * @default "BASIC"
     */
    tier?: repostspace.TierLevel;
    /**
     * Human-readable description of the private re:Post.
     */
    description?: string;
    /**
     * ARN of a customer-managed KMS key used to encrypt the space's data.
     * Changing the key replaces the space.
     * @default an AWS-owned key
     */
    userKMSKey?: string;
    /**
     * ARN of the IAM role that grants AWS re:Post Private access to
     * resources in your account (e.g. for IAM Identity Center integration).
     */
    roleArn?: string;
    /**
     * Email domains allowed to join the private re:Post without an explicit
     * invite.
     */
    supportedEmailDomains?: SpaceSupportedEmailDomains;
    /**
     * User-defined tags for the space. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Space extends Resource<"AWS.RePostSpace.Space", SpaceProps, {
    /**
     * Unique ID of the private re:Post space.
     */
    spaceId: string;
    /**
     * ARN of the space.
     */
    spaceArn: string;
    /**
     * Display name of the space.
     */
    name: string;
    /**
     * Current space status (e.g. `"CREATE_COMPLETED"`).
     */
    status: string;
    /**
     * IAM Identity Center configuration status of the space
     * (e.g. `"CONFIGURED"` / `"UNCONFIGURED"`).
     */
    configurationStatus: string;
    /**
     * Client ID of the space's IAM Identity Center application.
     */
    clientId: string;
    /**
     * ID of the IAM Identity Center identity store backing the space.
     */
    identityStoreId: string | undefined;
    /**
     * ARN of the space's IAM Identity Center application.
     */
    applicationArn: string | undefined;
    /**
     * Description of the space.
     */
    description: string | undefined;
    /**
     * Subdomain the space is served from.
     */
    vanityDomain: string;
    /**
     * Approval status of the vanity domain (e.g. `"PENDING"`, `"APPROVED"`).
     */
    vanityDomainStatus: string;
    /**
     * AWS-generated domain the space is reachable on.
     */
    randomDomain: string;
    /**
     * ARN of the customer-provided IAM role the space uses for account
     * integrations (mirrors the `roleArn` prop).
     */
    customerRoleArn: string | undefined;
    /**
     * Pricing tier of the space (`"BASIC"` or `"STANDARD"`).
     */
    tier: string;
    /**
     * Storage limit of the space, in bytes.
     */
    storageLimit: number;
    /**
     * Customer-managed KMS key encrypting the space's data, if any.
     */
    userKMSKey: string | undefined;
    /**
     * Tags on the space (including internal Alchemy tags).
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS re:Post Private space — a private, organization-scoped version of
 * AWS re:Post with curated Q&A, articles, and selected public content.
 *
 * re:Post Private is a paid feature (Basic or Standard tier) that requires
 * AWS IAM Identity Center to be enabled in the account. Space provisioning
 * is asynchronous and can take tens of minutes; the provider waits for the
 * space to reach `CREATE_COMPLETED` before returning.
 * ### Creating a Space
 * **Example:** Basic Space
 * ```typescript
 * import * as RePostSpace from "alchemy/AWS/RePostSpace";
 *
 * const space = yield* RePostSpace.Space("Support", {
 *   subdomain: "my-org-support",
 *   tier: "BASIC",
 * });
 * ```
 *
 * **Example:** Space with Description and Tags
 * ```typescript
 * const space = yield* RePostSpace.Space("Engineering", {
 *   name: "Engineering Knowledge Base",
 *   subdomain: "my-org-engineering",
 *   tier: "STANDARD",
 *   description: "Internal Q&A for the engineering org",
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * ### Encryption
 * **Example:** Space with a Customer-Managed KMS Key
 * ```typescript
 * const space = yield* RePostSpace.Space("Secure", {
 *   subdomain: "my-org-secure",
 *   userKMSKey: key.keyArn,
 * });
 * ```
 *
 * @resource
 */
export declare const Space: import("../../Resource.ts").ResourceClass<Space>;
declare const RePostSpaceProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "RePostSpaceProvisioningFailed";
} & Readonly<A>;
/**
 * Raised when a re:Post Private space enters a terminal failure state
 * (`CREATE_FAILED`) or starts deleting while the provider is waiting for
 * provisioning to complete.
 */
export declare class RePostSpaceProvisioningFailed extends RePostSpaceProvisioningFailed_base<{
    spaceId: string;
    status: string;
}> {
}
export declare const SpaceProvider: () => import("effect/Layer").Layer<Provider.Provider<Space>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Space.d.ts.map