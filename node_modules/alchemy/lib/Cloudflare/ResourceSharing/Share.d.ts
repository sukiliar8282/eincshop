import * as resourceSharing from "@distilled.cloud/cloudflare/resource-sharing";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.ResourceSharing.Share";
type TypeId = typeof TypeId;
/**
 * Type of resource that can be shared across accounts/organizations.
 */
export type ShareableResourceType = "custom-ruleset" | "gateway-policy" | "gateway-destination-ip" | "gateway-block-page-settings" | "gateway-extended-email-matching" | "idp-federation-grant";
/**
 * Lifecycle status of a share. Deletion is asynchronous — a deleted share
 * transitions `active → deleting → deleted`.
 */
export type ShareStatus = "active" | "deleting" | "deleted";
/**
 * A recipient of a share — exactly one of `accountId` / `organizationId`.
 */
export type ShareRecipientInput = {
    /**
     * Recipient account identifier. Exactly one of `accountId` /
     * `organizationId` must be set.
     */
    accountId?: string;
    /**
     * Recipient organization identifier. Exactly one of `accountId` /
     * `organizationId` must be set.
     */
    organizationId?: string;
};
/**
 * A resource entry shared by a share.
 */
export type ShareResourceInput = {
    /**
     * Type of the shared resource (e.g. `gateway-policy`).
     */
    resourceType: ShareableResourceType;
    /**
     * Identifier of the resource being shared (e.g. the gateway policy id).
     */
    resourceId: string;
    /**
     * Account that owns the resource being shared.
     * @default the current account
     */
    resourceAccountId?: string;
    /**
     * Resource metadata forwarded to the share API.
     * @default {}
     */
    meta?: unknown;
};
export type ShareProps = {
    /**
     * The name of the share. The only share-level mutable field. If omitted, a
     * unique name is generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Recipients of the share. The create API requires at least one. Changes
     * are reconciled via the recipient sub-API (add/remove deltas). Do not mix
     * with standalone `ShareRecipient` resources on the same share — the Share
     * provider treats this list as the full desired set.
     */
    recipients: ShareRecipientInput[];
    /**
     * Resources shared by the share. The create API requires at least one.
     * Changes are reconciled via the resource sub-API (`meta` updates in place;
     * changing `resourceType`/`resourceId` of an entry deletes and recreates
     * that entry). Do not mix with standalone `ShareResource` resources on the
     * same share — the Share provider treats this list as the full desired set.
     */
    resources: ShareResourceInput[];
};
export type ShareAttributes = {
    /**
     * Share identifier tag. Stable across updates.
     */
    shareId: string;
    /**
     * The Cloudflare account that owns (sends) the share.
     */
    accountId: string;
    /**
     * The name of the share.
     */
    name: string;
    /**
     * Lifecycle status of the share.
     */
    status: ShareStatus;
    /**
     * Whether the share targets an account or an organization.
     */
    targetType: "account" | "organization";
    /**
     * Whether this share is sent by or received by the current account.
     */
    kind: "sent" | "received";
    /**
     * Organization identifier of the owning account.
     */
    organizationId: string;
    /**
     * When the share was created.
     */
    created: string;
    /**
     * When the share was last modified.
     */
    modified: string;
};
export type Share = Resource<TypeId, ShareProps, ShareAttributes, never, Providers>;
/**
 * A Cloudflare resource share — shares account-level configuration (gateway
 * policies, custom rulesets, IdP federation grants, …) with another account
 * or organization.
 *
 * The create API requires at least one recipient and one resource, so both
 * are seeded inline. Post-create changes to those arrays are reconciled
 * through the recipient/resource sub-APIs; only `name` is mutable on the
 * share itself. Deletion is asynchronous (`active → deleting → deleted`).
 * ### Creating a Share
 * **Example:** Share a gateway policy with another account
 * ```typescript
 * const policy = yield* Cloudflare.Gateway.Rule("BlockPhishing", {
 *   action: "block",
 *   traffic: 'dns.fqdn == "phishing.example"',
 *   filters: ["dns"],
 * });
 *
 * const share = yield* Cloudflare.ResourceSharing.Share("PolicyShare", {
 *   recipients: [{ accountId: "<recipient-account-id>" }],
 *   resources: [
 *     { resourceType: "gateway-policy", resourceId: policy.ruleId },
 *   ],
 * });
 * ```
 *
 * ### Updating a Share
 * **Example:** Rename in place
 * ```typescript
 * const share = yield* Cloudflare.ResourceSharing.Share("PolicyShare", {
 *   name: "security-baseline-v2",
 *   recipients: [{ accountId: "<recipient-account-id>" }],
 *   resources: [
 *     { resourceType: "gateway-policy", resourceId: policy.ruleId },
 *   ],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/fundamentals/manage-account-resources/
 *
 * @resource
 * @product Resource Sharing
 * @category Account & Identity
 */
export declare const Share: import("../../Resource.ts").ResourceClass<Share>;
/**
 * Returns true if the given value is a Share resource.
 */
export declare const isShare: (value: unknown) => value is Share;
export declare const ShareProvider: () => import("effect/Layer").Layer<Provider.Provider<Share>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | resourceSharing.CloudflareOpContext>;
export {};
//# sourceMappingURL=Share.d.ts.map