import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * An inline rule definition owned by a detector version. Fraud Detector rules
 * are versioned resources scoped to a detector; a detector version references
 * a specific rule version. Declaring rules inline here lets the detector
 * version own their whole lifecycle.
 */
export interface RuleDefinition {
    /**
     * Identifier of the rule, unique within the detector (e.g. `high_risk`).
     */
    ruleId: string;
    /**
     * The rule expression, written in the rule language (see `language`). It
     * references variables and evaluates to a boolean, e.g.
     * `$order_price > 1000 and $email == "unknown"`.
     */
    expression: string;
    /**
     * Names of the outcomes returned when the rule matches. Must reference
     * existing Fraud Detector outcomes.
     */
    outcomes: string[];
    /**
     * The rule language. Only `DETECTORPL` is supported.
     * @default "DETECTORPL"
     */
    language?: string;
    /**
     * Human-readable description of the rule.
     */
    description?: string;
}
export interface DetectorVersionProps {
    /**
     * The identifier of the detector this version belongs to. Immutable —
     * changing it replaces the detector version.
     */
    detectorId: string;
    /**
     * Human-readable description of the version. Changing it replaces the
     * version (published versions are immutable).
     */
    description?: string;
    /**
     * The rules evaluated by this version, in priority order. Changing the set
     * of rules replaces the version.
     */
    rules: RuleDefinition[];
    /**
     * How rules are evaluated: `FIRST_MATCHED` stops at the first matching rule,
     * `ALL_MATCHED` evaluates every rule. Changing it replaces the version.
     * @default "FIRST_MATCHED"
     */
    ruleExecutionMode?: string;
    /**
     * The desired status of the version: `DRAFT`, `ACTIVE`, or `INACTIVE`. Only
     * an `ACTIVE` version serves predictions. This is an in-place update.
     * @default "ACTIVE"
     */
    status?: string;
    /**
     * User-defined tags for the detector version.
     */
    tags?: Record<string, string>;
}
export interface DetectorVersion extends Resource<"AWS.FraudDetector.DetectorVersion", DetectorVersionProps, {
    /** The identifier of the parent detector. */
    detectorId: string;
    /** The generated version identifier, e.g. `"1"`. */
    detectorVersionId: string;
    /** The ARN of the detector version. */
    arn: string;
    /** The version status: `DRAFT`, `ACTIVE`, or `INACTIVE`. */
    status: string;
}, never, Providers> {
}
/**
 * An Amazon Fraud Detector detector version — the deployable revision of a
 * detector. It bundles a set of rules (owned inline here) over the detector's
 * event type and, when `ACTIVE`, serves real-time predictions via
 * `getEventPrediction`. Rules and the version are cheap, rule-based
 * configuration objects — no model training is involved.
 *
 * ### Creating a Detector Version
 * **Example:** Active Version with One Rule
 * ```typescript
 * const version = yield* FraudDetector.DetectorVersion("v1", {
 *   detectorId: detector.detectorId,
 *   status: "ACTIVE",
 *   ruleExecutionMode: "FIRST_MATCHED",
 *   rules: [
 *     {
 *       ruleId: "high_risk",
 *       expression: '$email == "fraud@example.com"',
 *       outcomes: ["review"],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const DetectorVersion: import("../../Resource.ts").ResourceClass<DetectorVersion>;
export declare const DetectorVersionProvider: () => import("effect/Layer").Layer<Provider.Provider<DetectorVersion>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DetectorVersion.d.ts.map