import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Dlp.Entry";
type TypeId = typeof TypeId;
export interface EntryProps {
    /**
     * Name of the entry. If omitted, a unique name is generated from the
     * app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Whether the entry participates in scans.
     * @default true
     */
    enabled?: boolean;
    /**
     * The detection pattern.
     */
    pattern: {
        /** The regular expression to match. */
        regex: string;
        /** Optional checksum validation applied to matches. */
        validation?: "luhn";
    };
    /**
     * Optional description of the entry.
     */
    description?: string;
    /**
     * The custom DLP profile to attach the entry to at create time.
     * Immutable — changing it triggers a replacement.
     */
    profileId?: string;
}
export type EntryAttributes = {
    /** API UUID of the entry. */
    entryId: string;
    /** Account that owns the entry. */
    accountId: string;
    /** Observed entry name. */
    name: string;
    /** Whether the entry participates in scans. */
    enabled: boolean;
    /** Observed detection pattern. */
    pattern: {
        regex: string;
        validation: "luhn" | (string & {}) | undefined;
    };
    /** The profile the entry is attached to, if any. */
    profileId: string | undefined;
};
export type Entry = Resource<TypeId, EntryProps, EntryAttributes, never, Providers>;
/**
 * A Cloudflare Zero Trust **DLP custom entry** — a standalone regular-
 * expression detection that can be attached to a custom DLP profile.
 * Use it when entries are managed independently of the
 * {@link Profile} that groups them.
 *
 * Requires the Cloudflare DLP entitlement (a paid Zero Trust add-on);
 * accounts without it receive the typed `Forbidden` error on all writes.
 * ### Creating a DLP entry
 * **Example:** Attach a regex entry to a profile
 * ```typescript
 * const entry = yield* Cloudflare.Dlp.Entry("EmployeeId", {
 *   pattern: { regex: "EMP-[0-9]{6}" },
 *   profileId: profile.profileId,
 * });
 * ```
 *
 * **Example:** Luhn-validated card entry
 * ```typescript
 * const card = yield* Cloudflare.Dlp.Entry("CardNumber", {
 *   pattern: { regex: "[0-9]{13,16}", validation: "luhn" },
 *   profileId: profile.profileId,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/policies/data-loss-prevention/dlp-profiles/
 *
 * @resource
 * @product DLP
 * @category Cloudflare One (Zero Trust)
 */
export declare const Entry: import("../../Resource.ts").ResourceClass<Entry>;
/**
 * Returns true if the given value is a Entry resource.
 */
export declare const isEntry: (value: unknown) => value is Entry;
export declare const EntryProvider: () => import("effect/Layer").Layer<Provider.Provider<Entry>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=Entry.d.ts.map