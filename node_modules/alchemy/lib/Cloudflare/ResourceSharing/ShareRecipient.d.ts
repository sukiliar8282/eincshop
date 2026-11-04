import * as resourceSharing from "@distilled.cloud/cloudflare/resource-sharing";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.ResourceSharing.ShareRecipient";
type TypeId = typeof TypeId;
/**
 * Association status of a share recipient. Association is eventually
 * consistent — a new recipient transitions `associating → associated`.
 */
export type ShareRecipientAssociationStatus = "associating" | "associated" | "disassociating" | "disassociated";
export type ShareRecipientProps = {
    /**
     * The share the recipient is added to. Changing the share triggers a
     * replacement.
     */
    shareId: string;
    /**
     * Recipient account identifier. Exactly one of `accountId` /
     * `organizationId` must be set. Changing it triggers a replacement.
     */
    accountId?: string;
    /**
     * Recipient organization identifier. Exactly one of `accountId` /
     * `organizationId` must be set. Changing it triggers a replacement.
     */
    organizationId?: string;
};
export type ShareRecipientAttributes = {
    /**
     * Share recipient identifier tag. Stable for the life of the recipient.
     */
    recipientId: string;
    /**
     * The Cloudflare account that owns (sends) the share.
     */
    accountId: string;
    /**
     * The share the recipient belongs to.
     */
    shareId: string;
    /**
     * The recipient account identifier reported by Cloudflare.
     */
    recipientAccountId: string;
    /**
     * Association status of the recipient. Eventually consistent —
     * `associating` settles to `associated`.
     */
    associationStatus: ShareRecipientAssociationStatus;
    /**
     * When the recipient was created.
     */
    created: string;
    /**
     * When the recipient was last modified.
     */
    modified: string;
};
export type ShareRecipient = Resource<TypeId, ShareRecipientProps, ShareRecipientAttributes, never, Providers>;
/**
 * A recipient on an existing Cloudflare share — grants another account or
 * organization access to the share's resources.
 *
 * This is an existence-only resource: there is no update API, so every prop
 * change triggers a replacement. Association is eventually consistent
 * (`associating → associated`). Do not manage the same recipient both inline
 * on `Share.recipients` and through this resource.
 * ### Adding a Recipient
 * **Example:** Share with another account
 * ```typescript
 * const recipient = yield* Cloudflare.ResourceSharing.ShareRecipient("Partner", {
 *   shareId: share.shareId,
 *   accountId: "<recipient-account-id>",
 * });
 * ```
 *
 * **Example:** Share with an organization
 * ```typescript
 * const recipient = yield* Cloudflare.ResourceSharing.ShareRecipient("Org", {
 *   shareId: share.shareId,
 *   organizationId: "<recipient-organization-id>",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/fundamentals/manage-account-resources/
 *
 * @resource
 * @product Resource Sharing
 * @category Account & Identity
 */
export declare const ShareRecipient: import("../../Resource.ts").ResourceClass<ShareRecipient>;
/**
 * Returns true if the given value is a ShareRecipient resource.
 */
export declare const isShareRecipient: (value: unknown) => value is ShareRecipient;
export declare const ShareRecipientProvider: () => import("effect/Layer").Layer<Provider.Provider<ShareRecipient>, never, CloudflareEnvironment | resourceSharing.CloudflareOpContext>;
export {};
//# sourceMappingURL=ShareRecipient.d.ts.map