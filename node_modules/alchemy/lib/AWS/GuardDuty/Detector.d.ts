import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * How frequently GuardDuty exports updated findings.
 */
export type FindingPublishingFrequency = "FIFTEEN_MINUTES" | "ONE_HOUR" | "SIX_HOURS";
export interface DetectorProps {
    /**
     * Whether the detector is enabled. A disabled detector stops analyzing data
     * sources but is not deleted.
     * @default true
     */
    enable?: boolean;
    /**
     * How frequently GuardDuty publishes updated findings to CloudWatch Events.
     * @default "SIX_HOURS"
     */
    findingPublishingFrequency?: FindingPublishingFrequency;
    /**
     * Tags applied to the detector. Alchemy ownership tags are merged in
     * automatically so the detector can be recognized on subsequent runs.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface Detector extends Resource<"AWS.GuardDuty.Detector", DetectorProps, {
    /** The auto-generated detector ID (unique per account/region). */
    detectorId: string;
    /** ARN of the detector — the IAM resource for detector-scoped actions. */
    detectorArn: string;
    /** Current status of the detector (`ENABLED` / `DISABLED`). */
    status: string | undefined;
    /** The effective finding-publishing frequency. */
    findingPublishingFrequency: string | undefined;
}, never, Providers> {
}
/**
 * A GuardDuty detector — the account/region singleton that enables Amazon
 * GuardDuty threat detection. Only one detector can exist per region, so this
 * resource is a capture-and-restore singleton: adopting a pre-existing detector
 * that Alchemy did not create requires `--adopt`.
 *
 * ### Enabling GuardDuty
 * **Example:** Enable with default settings
 * ```typescript
 * const detector = yield* GuardDuty.Detector("Detector", {});
 * ```
 *
 * **Example:** Frequent finding publishing
 * ```typescript
 * const detector = yield* GuardDuty.Detector("Detector", {
 *   enable: true,
 *   findingPublishingFrequency: "FIFTEEN_MINUTES",
 *   tags: { team: "security" },
 * });
 * ```
 */
declare const DetectorResource: import("../../Resource.ts").ResourceClass<Detector>;
export { DetectorResource as Detector };
export declare const detectorArn: (region: string, accountId: string, detectorId: string) => string;
export declare const DetectorProvider: () => import("effect/Layer").Layer<Provider.Provider<Detector>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Detector.d.ts.map