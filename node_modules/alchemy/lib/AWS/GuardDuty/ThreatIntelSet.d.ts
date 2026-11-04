import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/** File format of the hosted threat intelligence list. */
export type ThreatIntelSetFormat = "TXT" | "STIX" | "OTX_CSV" | "ALIEN_VAULT" | "PROOF_POINT" | "FIRE_EYE";
export interface ThreatIntelSetProps {
    /**
     * ID of the detector the threat intel set belongs to. Changing this
     * replaces the set.
     */
    detectorId: string;
    /**
     * Display name of the threat intel set. If omitted, a unique name is
     * generated. Updatable in place.
     */
    name?: string;
    /**
     * Format of the file hosting the threat list. Changing this replaces the
     * set.
     */
    format: ThreatIntelSetFormat;
    /**
     * S3 URI of the file containing known malicious IP addresses, e.g.
     * `https://s3.amazonaws.com/my-bucket/threats.txt`. Updatable in place.
     */
    location: string;
    /**
     * Whether GuardDuty actively uses the list. Traffic to/from listed IPs
     * generates findings while active. Updatable in place.
     * @default true
     */
    activate?: boolean;
    /**
     * Account ID of the bucket owner hosting the list (guards against bucket
     * squatting).
     */
    expectedBucketOwner?: string;
    /**
     * Tags applied to the threat intel set. Alchemy ownership tags are merged
     * in automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface ThreatIntelSet extends Resource<"AWS.GuardDuty.ThreatIntelSet", ThreatIntelSetProps, {
    /** ID of the detector the set belongs to. */
    detectorId: string;
    /** The auto-generated threat intel set ID. */
    threatIntelSetId: string;
    /** ARN of the threat intel set. */
    threatIntelSetArn: string;
    /** Display name of the set. */
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
 * A GuardDuty threat intelligence set — an S3-hosted list of known malicious
 * IP addresses that GuardDuty generates findings for. The list file must
 * exist in S3 before activation; name, location, and activation are
 * updatable in place, while format changes replace the set.
 *
 * ### Custom Threat Intelligence
 * **Example:** Feed a custom threat list
 * ```typescript
 * const detector = yield* AWS.GuardDuty.Detector("Detector", {});
 * const threats = yield* AWS.GuardDuty.ThreatIntelSet("BadIPs", {
 *   detectorId: detector.detectorId,
 *   format: "TXT",
 *   location: "https://s3.amazonaws.com/my-security-bucket/threats.txt",
 * });
 * ```
 */
declare const ThreatIntelSetResource: import("../../Resource.ts").ResourceClass<ThreatIntelSet>;
export { ThreatIntelSetResource as ThreatIntelSet };
export declare const ThreatIntelSetProvider: () => import("effect/Layer").Layer<Provider.Provider<ThreatIntelSet>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ThreatIntelSet.d.ts.map