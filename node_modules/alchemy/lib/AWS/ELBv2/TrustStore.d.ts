import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type TrustStoreArn = `arn:aws:elasticloadbalancing:${RegionID}:${AccountID}:truststore/${string}`;
export interface TrustStoreProps {
    /** The trust store name. If omitted, a unique name is generated. Changing it replaces the trust store. */
    name?: string;
    /** The S3 bucket holding the CA certificate bundle (PEM). */
    caCertificatesBundleS3Bucket: string;
    /** The S3 key of the CA certificate bundle. */
    caCertificatesBundleS3Key: string;
    /** The S3 object version of the CA certificate bundle. */
    caCertificatesBundleS3ObjectVersion?: string;
    /** Tags to apply to the trust store. */
    tags?: Record<string, string>;
}
export interface TrustStore extends Resource<"AWS.ELBv2.TrustStore", TrustStoreProps, {
    /** The ARN of the trust store. */
    trustStoreArn: TrustStoreArn;
    /** The name of the trust store. */
    name: string;
    /** The status of the trust store (`ACTIVE` or `CREATING`). */
    status: string;
    /** The number of CA certificates in the trust store's bundle. */
    numberOfCaCertificates: number;
    /** The tags applied to the trust store. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An ELBv2 trust store. A trust store holds the CA certificate bundle used by
 * an HTTPS listener configured for mutual TLS (mTLS) `verify` mode to validate
 * client certificates.
 * ### Creating a Trust Store
 * **Example:** Basic trust store from an S3 CA bundle
 * ```typescript
 * const trustStore = yield* TrustStore("mtls", {
 *   caCertificatesBundleS3Bucket: "my-ca-bundles",
 *   caCertificatesBundleS3Key: "ca-bundle.pem",
 * });
 * ```
 *
 * **Example:** Using a trust store on an mTLS listener
 * ```typescript
 * const listener = yield* Listener("https", {
 *   loadBalancerArn: lb.loadBalancerArn,
 *   port: 443,
 *   protocol: "HTTPS",
 *   certificates: [certArn],
 *   mutualAuthentication: {
 *     mode: "verify",
 *     trustStoreArn: trustStore.trustStoreArn,
 *   },
 *   defaultActions: [
 *     { type: "forward", targetGroups: [{ targetGroupArn: tg.targetGroupArn }] },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const TrustStore: import("../../Resource.ts").ResourceClass<TrustStore>;
export declare const TrustStoreProvider: () => import("effect/Layer").Layer<Provider.Provider<TrustStore>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=TrustStore.d.ts.map