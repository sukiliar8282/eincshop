import * as b2bi from "@distilled.cloud/aws/b2bi";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PartnershipProps {
    /**
     * The unique identifier for the profile connected to this partnership.
     * May reference a {@link Profile}'s `profileId` output. Changing the
     * profile replaces the partnership.
     */
    profileId: string;
    /**
     * The name of the partnership.
     */
    name: string;
    /**
     * The email address associated with the trading partner.
     */
    email: string;
    /**
     * The phone number associated with the trading partner, in E.164 format.
     */
    phone?: string;
    /**
     * A list of capability IDs (see {@link Capability}) enabled for this
     * partnership.
     */
    capabilities?: string[];
    /**
     * Inbound/outbound EDI options that override the defaults for this
     * partnership.
     */
    capabilityOptions?: b2bi.CapabilityOptions;
    /**
     * User-defined tags for the partnership.
     */
    tags?: Record<string, string>;
}
export interface Partnership extends Resource<"AWS.B2BI.Partnership", PartnershipProps, {
    /**
     * Service-assigned unique ID of the partnership.
     */
    partnershipId: string;
    /**
     * ARN of the partnership.
     */
    partnershipArn: string;
    /**
     * ID of the profile the partnership belongs to.
     */
    profileId: string;
    /**
     * Service-assigned ID of the trading partner.
     */
    tradingPartnerId: string | undefined;
}, never, Providers> {
}
/**
 * An AWS B2B Data Interchange (B2BI) partnership. A partnership connects a
 * customer {@link Profile} to a trading partner and enables a set of
 * {@link Capability | capabilities} for exchanging EDI documents.
 * ### Creating a Partnership
 * **Example:** Basic Partnership
 * ```typescript
 * const partnership = yield* B2BI.Partnership("AcmeToPartner", {
 *   profileId: profile.profileId,
 *   name: "acme-partner",
 *   email: "edi@partner.example",
 *   capabilities: [capability.capabilityId],
 * });
 * ```
 *
 * @resource
 */
export declare const Partnership: import("../../Resource.ts").ResourceClass<Partnership>;
export declare const PartnershipProvider: () => import("effect/Layer").Layer<Provider.Provider<Partnership>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Partnership.d.ts.map