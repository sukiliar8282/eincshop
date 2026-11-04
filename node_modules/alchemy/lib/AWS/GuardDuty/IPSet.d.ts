import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/** File format of the hosted IP list. */
export type IpSetFormat = "TXT" | "STIX" | "OTX_CSV" | "ALIEN_VAULT" | "PROOF_POINT" | "FIRE_EYE";
export interface IPSetProps {
    /**
     * ID of the detector the trusted IP set belongs to. Changing this replaces
     * the IP set.
     */
    detectorId: string;
    /**
     * Display name of the IP set. If omitted, a unique name is generated.
     * Updatable in place.
     */
    name?: string;
    /**
     * Format of the file hosting the IP list. Changing this replaces the IP
     * set.
     */
    format: IpSetFormat;
    /**
     * S3 URI of the file containing the trusted IP list, e.g.
     * `https://s3.amazonaws.com/my-bucket/trusted.txt`. Updatable in place.
     */
    location: string;
    /**
     * Whether GuardDuty actively uses the IP set. Traffic from trusted IPs
     * does not generate findings while active. Updatable in place.
     * @default true
     */
    activate?: boolean;
    /**
     * Account ID of the bucket owner hosting the list (guards against bucket
     * squatting).
     */
    expectedBucketOwner?: string;
    /**
     * Tags applied to the IP set. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface IPSet extends Resource<"AWS.GuardDuty.IPSet", IPSetProps, {
    /** ID of the detector the IP set belongs to. */
    detectorId: string;
    /** The auto-generated IP set ID. */
    ipSetId: string;
    /** ARN of the IP set. */
    ipSetArn: string;
    /** Display name of the IP set. */
    name: string;
    /** File format of the hosted list. */
    format: string;
    /** S3 URI of the hosted list. */
    location: string;
    /** Current status (`ACTIVE`, `INACTIVE`, `ACTIVATING`, `ERROR`, …). */
    status: string;
}, never, Providers> {
}
/**
 * A GuardDuty trusted IP set — an S3-hosted list of IP addresses GuardDuty
 * treats as trusted, suppressing findings for traffic from them. The list
 * file must exist in S3 before activation; name, location, and activation
 * are updatable in place, while format changes replace the set.
 *
 * ### Trusting Known IPs
 * **Example:** Trust the office IP range
 * ```typescript
 * const detector = yield* AWS.GuardDuty.Detector("Detector", {});
 * const ipSet = yield* AWS.GuardDuty.IPSet("OfficeIPs", {
 *   detectorId: detector.detectorId,
 *   format: "TXT",
 *   location: "https://s3.amazonaws.com/my-security-bucket/office-ips.txt",
 * });
 * ```
 *
 * **Example:** Stage a list without activating it
 * ```typescript
 * const ipSet = yield* AWS.GuardDuty.IPSet("StagedIPs", {
 *   detectorId: detector.detectorId,
 *   format: "TXT",
 *   location: "https://s3.amazonaws.com/my-security-bucket/staged.txt",
 *   activate: false,
 * });
 * ```
 */
declare const IPSetResource: import("../../Resource.ts").ResourceClass<IPSet>;
export { IPSetResource as IPSet };
export declare const IPSetProvider: () => import("effect/Layer").Layer<Provider.Provider<IPSet>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=IPSet.d.ts.map