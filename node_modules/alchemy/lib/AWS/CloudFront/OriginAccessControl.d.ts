import * as cloudfront from "@distilled.cloud/aws/cloudfront";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface OriginAccessControlProps {
    /**
     * Name of the origin access control. If omitted, a deterministic name is generated.
     */
    name?: string;
    /**
     * Optional description of the origin access control.
     */
    description?: string;
    /**
     * The origin type this OAC signs for.
     * @default "s3"
     */
    originType?: cloudfront.OriginAccessControlOriginTypes;
    /**
     * How CloudFront should apply signing.
     * @default "always"
     */
    signingBehavior?: cloudfront.OriginAccessControlSigningBehaviors;
    /**
     * Signing protocol used by CloudFront.
     * @default "sigv4"
     */
    signingProtocol?: cloudfront.OriginAccessControlSigningProtocols;
}
export interface OriginAccessControl extends Resource<"AWS.CloudFront.OriginAccessControl", OriginAccessControlProps, {
    /**
     * CloudFront-assigned OAC identifier.
     */
    originAccessControlId: string;
    /**
     * Name of the OAC.
     */
    name: string;
    /**
     * Current description of the OAC.
     */
    description: string | undefined;
    /**
     * Origin type configured for the OAC.
     */
    originType: cloudfront.OriginAccessControlOriginTypes;
    /**
     * Signing behavior configured for the OAC.
     */
    signingBehavior: cloudfront.OriginAccessControlSigningBehaviors;
    /**
     * Signing protocol configured for the OAC.
     */
    signingProtocol: cloudfront.OriginAccessControlSigningProtocols;
    /**
     * Most recent entity tag for update/delete operations.
     */
    etag: string | undefined;
}, never, Providers> {
}
/**
 * A CloudFront Origin Access Control for private origins.
 *
 * `OriginAccessControl` is the recommended CloudFront access model for private
 * S3 origins and newer signed-origin integrations.
 * ### Creating Origin Access Controls
 * **Example:** S3 Origin Access Control
 * ```typescript
 * const oac = yield* OriginAccessControl("SiteOriginAccess", {
 *   originType: "s3",
 * });
 * ```
 *
 * @resource
 */
export declare const OriginAccessControl: import("../../Resource.ts").ResourceClass<OriginAccessControl>;
export declare const OriginAccessControlProvider: () => import("effect/Layer").Layer<Provider.Provider<OriginAccessControl>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=OriginAccessControl.d.ts.map