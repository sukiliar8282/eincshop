import * as organizations from "@distilled.cloud/cloudflare/organizations";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Organization.Organization";
type TypeId = typeof TypeId;
/**
 * Business profile attached to an organization. All fields are required
 * when a profile is present — the API stores the profile as a unit.
 */
export interface Profile {
    /**
     * Street address of the business that owns the organization.
     */
    businessAddress: string;
    /**
     * Contact email of the business.
     */
    businessEmail: string;
    /**
     * Legal name of the business.
     */
    businessName: string;
    /**
     * Contact phone number of the business.
     */
    businessPhone: string;
    /**
     * Free-form external metadata (e.g. a CRM or billing reference).
     */
    externalMetadata: string;
}
/**
 * Feature flags Cloudflare sets on an organization. Read-only —
 * controlled by the organization's entitlements.
 */
export interface Flags {
    /**
     * Whether accounts may be created under this organization.
     */
    accountCreation: string;
    /**
     * Whether accounts may be deleted under this organization.
     */
    accountDeletion: string;
    /**
     * Whether accounts may be migrated into this organization.
     */
    accountMigration: string;
    /**
     * Whether accounts may be moved between organizations.
     */
    accountMobility: string;
    /**
     * Whether sub-organizations may be created under this organization.
     */
    subOrgCreation: string;
}
export interface Props {
    /**
     * Display name of the organization. Mutable in place. If omitted, a
     * unique name is generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * ID of the parent organization, for building an organization
     * hierarchy. Changing the parent triggers a replacement — re-parenting
     * is gated by the organization's `accountMobility`/flags and is not
     * supported in place.
     */
    parent?: string;
    /**
     * Business profile of the organization. Mutable in place.
     */
    profile?: Profile;
}
export interface Attributes {
    /**
     * Cloudflare-assigned identifier of the organization.
     */
    organizationId: string;
    /**
     * Display name of the organization.
     */
    name: string;
    /**
     * ISO8601 timestamp of when the organization was created.
     */
    createTime: string;
    /**
     * Who manages this organization, if it is managed by a parent entity.
     */
    managedBy: string | undefined;
    /**
     * Feature flags controlled by the organization's entitlements.
     */
    flags: Flags | undefined;
    /**
     * Parent organization, if this organization is part of a hierarchy.
     */
    parent: {
        id: string;
        name: string;
    } | undefined;
    /**
     * Business profile of the organization, if one is set.
     */
    profile: Profile | undefined;
}
export type Organization = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * A Cloudflare Organization — the hierarchical container above accounts.
 *
 * Organizations group accounts (and sub-organizations) under a single
 * management umbrella; an account's `managedBy.parentOrgId` points at its
 * owning organization. The feature is entitlement-gated: only tenant /
 * organizations-enabled customers can create organizations — on a standard
 * account every `/organizations` call fails with the typed `Forbidden`
 * error.
 *
 * `name` and `profile` are mutable in place; changing `parent` triggers a
 * replacement.
 *
 * Safety: organizations carry no ownership markers. When there is no prior
 * state, `read` scans for an existing organization with the same name
 * (and parent) and reports it as `Unowned`, so the engine refuses to take
 * it over unless `--adopt` (or `adopt(true)`) is set.
 * ### Creating an Organization
 * **Example:** Basic organization
 * ```typescript
 * const org = yield* Cloudflare.Organization.Organization("Platform", {
 *   name: "acme-platform",
 * });
 * ```
 *
 * **Example:** Organization with a business profile
 * ```typescript
 * const org = yield* Cloudflare.Organization.Organization("Platform", {
 *   name: "acme-platform",
 *   profile: {
 *     businessName: "Acme Corp",
 *     businessEmail: "ops@acme.com",
 *     businessPhone: "+1-555-0100",
 *     businessAddress: "1 Acme Way, Springfield",
 *     externalMetadata: "crm:acct-42",
 *   },
 * });
 * ```
 *
 * ### Hierarchies
 * **Example:** Sub-organization under a parent
 * ```typescript
 * const parent = yield* Cloudflare.Organization.Organization("Root", {
 *   name: "acme-root",
 * });
 * // Changing `parent` later replaces the sub-organization.
 * const sub = yield* Cloudflare.Organization.Organization("Emea", {
 *   name: "acme-emea",
 *   parent: parent.organizationId,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/fundamentals/setup/manage-organizations/
 *
 * @resource
 * @product Organizations
 * @category Account & Identity
 */
export declare const Organization: import("../../Resource.ts").ResourceClass<Organization>;
/**
 * Returns true if the given value is an Organization resource.
 */
export declare const isOrganization: (value: unknown) => value is Organization;
export declare const OrganizationProvider: () => import("effect/Layer").Layer<Provider.Provider<Organization>, never, import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | organizations.CloudflareOpContext>;
export {};
//# sourceMappingURL=Organization.d.ts.map