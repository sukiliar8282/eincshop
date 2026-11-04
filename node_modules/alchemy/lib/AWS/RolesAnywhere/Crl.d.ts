import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface CrlProps {
    /**
     * Name of the CRL. If omitted, a unique name is generated from the app,
     * stage and logical ID. The name is updatable in place.
     */
    crlName?: string;
    /**
     * PEM-encoded certificate revocation list issued by the trust anchor's CA.
     * IAM Roles Anywhere validates presented certificates against the CRL
     * before issuing credentials.
     */
    crlData: string;
    /**
     * ARN of the trust anchor the CRL is associated with. Immutable after
     * import — changing it replaces the CRL.
     */
    trustAnchorArn: string;
    /**
     * Whether the CRL is enabled. When enabled, certificates listed in the CRL
     * are unauthorized to receive session credentials.
     * @default true
     */
    enabled?: boolean;
    /**
     * User-defined tags for the CRL.
     */
    tags?: Record<string, string>;
}
export interface Crl extends Resource<"AWS.RolesAnywhere.Crl", CrlProps, {
    /**
     * Unique ID of the CRL.
     */
    crlId: string;
    /**
     * ARN of the CRL.
     */
    crlArn: string;
    /**
     * Name of the CRL.
     */
    crlName: string;
    /**
     * ARN of the trust anchor the CRL applies to.
     */
    trustAnchorArn: string;
    /**
     * Whether the CRL is enabled (revocation checks are enforced).
     */
    enabled: boolean;
}, never, Providers> {
}
/**
 * An IAM Roles Anywhere certificate revocation list (CRL). A CRL is a
 * PEM-encoded list of certificates revoked by the trust anchor's certificate
 * authority; IAM Roles Anywhere refuses to vend credentials for revoked
 * certificates while the CRL is enabled.
 * ### Importing a CRL
 * **Example:** CRL for a Trust Anchor
 * ```typescript
 * const anchor = yield* RolesAnywhere.TrustAnchor("Anchor", {
 *   certificateBundle: CA_CERTIFICATE_PEM,
 * });
 * const crl = yield* RolesAnywhere.Crl("Crl", {
 *   crlData: CRL_PEM,
 *   trustAnchorArn: anchor.trustAnchorArn,
 * });
 * ```
 *
 * ### Rotating the CRL
 * **Example:** Updated Revocation Data
 * ```typescript
 * const crl = yield* RolesAnywhere.Crl("Crl", {
 *   crlData: NEXT_CRL_PEM, // re-deploy with the CA's latest CRL
 *   trustAnchorArn: anchor.trustAnchorArn,
 * });
 * ```
 *
 * @resource
 */
export declare const Crl: import("../../Resource.ts").ResourceClass<Crl>;
export declare const CrlProvider: () => import("effect/Layer").Layer<Provider.Provider<Crl>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Crl.d.ts.map