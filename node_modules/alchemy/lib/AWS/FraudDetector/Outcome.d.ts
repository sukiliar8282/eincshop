import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface OutcomeProps {
    /**
     * Name of the outcome. If omitted, a unique lowercase name is generated from
     * the app, stage, and logical ID. Changing the name replaces the outcome.
     */
    name?: string;
    /**
     * Human-readable description. This is an in-place update.
     */
    description?: string;
    /**
     * User-defined tags for the outcome.
     */
    tags?: Record<string, string>;
}
export interface Outcome extends Resource<"AWS.FraudDetector.Outcome", OutcomeProps, {
    /** The name of the outcome. */
    name: string;
    /** The ARN of the outcome. */
    arn: string;
}, never, Providers> {
}
/**
 * An Amazon Fraud Detector outcome — the result a rule produces when it matches
 * (e.g. `approve`, `review`, `block`). Detector rules reference outcomes; they
 * are cheap metadata objects.
 *
 * ### Creating an Outcome
 * **Example:** Approve and Review Outcomes
 * ```typescript
 * const approve = yield* FraudDetector.Outcome("approve", {
 *   description: "let the transaction through",
 * });
 * const review = yield* FraudDetector.Outcome("review", {});
 * ```
 *
 * @resource
 */
export declare const Outcome: import("../../Resource.ts").ResourceClass<Outcome>;
export declare const OutcomeProvider: () => import("effect/Layer").Layer<Provider.Provider<Outcome>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Outcome.d.ts.map