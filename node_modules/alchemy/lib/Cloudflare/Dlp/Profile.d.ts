import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Dlp.Profile";
type TypeId = typeof TypeId;
/**
 * A detection entry defined inline on the profile — a regular expression
 * the DLP engine scans for.
 */
export interface ProfileEntry {
    /** Name of the entry. Unique within the profile. */
    name: string;
    /** Whether the entry participates in scans. */
    enabled: boolean;
    /** The detection pattern. */
    pattern: {
        /** The regular expression to match. */
        regex: string;
        /** Optional checksum validation applied to matches. */
        validation?: "luhn";
    };
    /** Optional description of the entry. */
    description?: string;
}
export interface ProfileProps {
    /**
     * Name of the profile. If omitted, a unique name is generated from the
     * app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The description of the profile.
     */
    description?: string;
    /**
     * Related DLP policies will trigger when the match count exceeds this
     * number.
     * @default 0
     */
    allowedMatchCount?: number;
    /**
     * Whether to scan images via OCR.
     */
    ocrEnabled?: boolean;
    /**
     * Confidence threshold applied to AI-context detections
     * (`low` | `medium` | `high` | `very_high`).
     */
    confidenceThreshold?: string;
    /**
     * Custom detection entries owned by this profile. Synced declaratively:
     * entries are matched to observed entries by name; entries removed from
     * this list are deleted from the profile.
     */
    entries?: ProfileEntry[];
}
export type ProfileAttributes = {
    /** API UUID of the profile. */
    profileId: string;
    /** Account that owns the profile. */
    accountId: string;
    /** Observed profile name. */
    name: string;
    /** Observed description, if any. */
    description: string | undefined;
    /** Observed allowed match count. */
    allowedMatchCount: number;
    /** Whether OCR scanning is enabled. */
    ocrEnabled: boolean;
    /** Ids of the custom entries owned by the profile, keyed by name. */
    entryIds: Record<string, string>;
};
export type Profile = Resource<TypeId, ProfileProps, ProfileAttributes, never, Providers>;
/**
 * A Cloudflare Zero Trust **DLP custom profile** — a named collection of
 * detection entries (regular expressions) that Gateway HTTP policies and
 * CASB integrations reference to detect sensitive data in transit.
 *
 * Requires the Cloudflare DLP entitlement (a paid Zero Trust add-on);
 * accounts without it receive the typed `Forbidden` error on all writes.
 * ### Creating a DLP profile
 * **Example:** Profile with a custom regex entry
 * ```typescript
 * const profile = yield* Cloudflare.Dlp.Profile("EmployeeIds", {
 *   description: "Detects internal employee identifiers",
 *   allowedMatchCount: 0,
 *   entries: [
 *     {
 *       name: "employee-id",
 *       enabled: true,
 *       pattern: { regex: "EMP-[0-9]{6}" },
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Credit-card-like entry with Luhn validation
 * ```typescript
 * const cards = yield* Cloudflare.Dlp.Profile("Cards", {
 *   entries: [
 *     {
 *       name: "card-number",
 *       enabled: true,
 *       pattern: { regex: "[0-9]{13,16}", validation: "luhn" },
 *     },
 *   ],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/policies/data-loss-prevention/dlp-profiles/
 *
 * @resource
 * @product DLP
 * @category Cloudflare One (Zero Trust)
 */
export declare const Profile: import("../../Resource.ts").ResourceClass<Profile>;
/**
 * Returns true if the given value is a Profile resource.
 */
export declare const isProfile: (value: unknown) => value is Profile;
export declare const ProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<Profile>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=Profile.d.ts.map