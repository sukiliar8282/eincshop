import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ResourceShareProps {
    /**
     * Name of the resource share. Must be unique within your account. If omitted,
     * Alchemy generates a deterministic name from the stack, stage, and logical ID.
     * Max 128 characters.
     */
    shareName?: string;
    /**
     * ARNs of the resources to share (for example a Subnet, License, or Resolver
     * rule ARN). Resources can be added or removed on update.
     */
    resourceArns?: string[];
    /**
     * Principals to share with. Each principal is one of: a 12-digit account ID,
     * an organization ARN, an organizational unit (OU) ARN, an IAM role ARN, or an
     * IAM user ARN. Principals can be added or removed on update.
     */
    principals?: string[];
    /**
     * Source accounts or ARNs whose resources are shared through this share.
     * Used by service-managed shares. Sources can be added or removed on update.
     */
    sources?: string[];
    /**
     * Whether principals outside your AWS organization are allowed. When sharing
     * with accounts or OUs inside your organization (with RAM organization sharing
     * enabled) set this to `false` so shares are auto-accepted.
     * @default true
     */
    allowExternalPrincipals?: boolean;
    /**
     * ARNs of the RAM managed permissions to associate with the share at creation
     * time. Changing this list replaces the resource share.
     */
    permissionArns?: string[];
    /**
     * Tags applied to the resource share.
     */
    tags?: Record<string, string>;
}
export interface ResourceShare extends Resource<"AWS.RAM.ResourceShare", ResourceShareProps, {
    /** ARN of the resource share. */
    resourceShareArn: string;
    /** Name of the resource share. */
    name: string;
    /** Account ID that owns the resource share. */
    owningAccountId: string | undefined;
    /** Whether principals outside the organization are allowed. */
    allowExternalPrincipals: boolean | undefined;
    /** Current lifecycle status (`ACTIVE`, `PENDING`, `FAILED`, ...). */
    status: string | undefined;
    /** Tags applied to the resource share. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Resource Access Manager (RAM) resource share.
 *
 * A resource share grants principals (accounts, organizational units, or IAM
 * identities) access to a set of shared resources identified by ARN.
 *
 * ### Creating a Resource Share
 * **Example:** Share subnets with an organizational unit
 * ```typescript
 * const share = yield* ResourceShare("NetworkShare", {
 *   resourceArns: [subnet.subnetArn],
 *   principals: [ou.ouArn],
 *   allowExternalPrincipals: false,
 * });
 * ```
 *
 * **Example:** Share with an external account
 * ```typescript
 * const share = yield* ResourceShare("ExternalShare", {
 *   resourceArns: [resolverRule.arn],
 *   principals: ["123456789012"],
 *   allowExternalPrincipals: true,
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * @resource
 */
export declare const ResourceShare: import("../../Resource.ts").ResourceClass<ResourceShare>;
export declare const ResourceShareProvider: () => import("effect/Layer").Layer<Provider.Provider<ResourceShare>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ResourceShare.d.ts.map