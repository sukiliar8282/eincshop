import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DetectorProps {
    /**
     * The detector identifier. If omitted, a unique lowercase id is generated
     * from the app, stage, and logical ID. Changing it replaces the detector.
     */
    detectorId?: string;
    /**
     * Human-readable description. This is an in-place update.
     */
    description?: string;
    /**
     * Name of the event type this detector evaluates. Immutable — changing it
     * replaces the detector.
     */
    eventTypeName: string;
    /**
     * User-defined tags for the detector.
     */
    tags?: Record<string, string>;
}
export interface Detector extends Resource<"AWS.FraudDetector.Detector", DetectorProps, {
    /** The detector identifier. */
    detectorId: string;
    /** The ARN of the detector. */
    arn: string;
    /** The event type the detector evaluates. */
    eventTypeName: string;
}, never, Providers> {
}
/**
 * An Amazon Fraud Detector detector — the container that binds an event type
 * to versioned rule sets and models used to evaluate fraud. Creating the
 * detector is cheap; the rules, models, and detector versions that produce
 * predictions are provisioned separately.
 *
 * ### Creating a Detector
 * **Example:** Basic Detector
 * ```typescript
 * const detector = yield* FraudDetector.Detector("checkout", {
 *   eventTypeName: purchase.name,
 * });
 * ```
 *
 * **Example:** Detector with an Active Version
 * ```typescript
 * const detector = yield* FraudDetector.Detector("checkout", {
 *   eventTypeName: purchase.name,
 * });
 *
 * const version = yield* FraudDetector.DetectorVersion("v1", {
 *   detectorId: detector.detectorId,
 *   status: "ACTIVE",
 *   rules: [
 *     {
 *       ruleId: "high_risk",
 *       expression: '$email == "fraud@example.com"',
 *       outcomes: [review.name],
 *     },
 *   ],
 * });
 * ```
 *
 * ### Runtime Predictions
 * Bind `GetEventPrediction` in the init phase (providing the
 * `GetEventPredictionHttp` layer on the Function effect) and score events at
 * runtime against the detector's `ACTIVE` version.
 *
 * **Example:** Score an event from a Lambda
 * ```typescript
 * // init
 * const getEventPrediction = yield* FraudDetector.GetEventPrediction(detector);
 *
 * // runtime
 * const { ruleResults } = yield* getEventPrediction({
 *   eventId: "order-123",
 *   eventTypeName: "purchase",
 *   eventTimestamp: new Date().toISOString(),
 *   entities: [{ entityType: "customer", entityId: "cust-1" }],
 *   eventVariables: { email: "buyer@example.com", ip: "1.2.3.4" },
 * });
 * ```
 *
 * @resource
 */
export declare const Detector: import("../../Resource.ts").ResourceClass<Detector>;
export declare const DetectorProvider: () => import("effect/Layer").Layer<Provider.Provider<Detector>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Detector.d.ts.map