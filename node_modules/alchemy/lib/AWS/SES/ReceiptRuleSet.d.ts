import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ReceiptRuleSetProps {
    /**
     * Name of the receipt rule set. May contain letters, numbers, dashes,
     * underscores and periods, up to 64 characters, and must start and end with
     * a letter or number. If omitted, a deterministic physical name is generated
     * from the app, stage, and logical ID. Changing the name replaces the rule
     * set.
     */
    ruleSetName?: string;
}
export interface ReceiptRuleSet extends Resource<"AWS.SES.ReceiptRuleSet", ReceiptRuleSetProps, {
    /** Name of the receipt rule set. */
    ruleSetName: string;
}, never, Providers> {
}
/**
 * An Amazon SES receipt rule set — the ordered container for the receipt rules
 * that decide what happens to inbound email (deliver to S3, invoke a Lambda,
 * publish to SNS, bounce, etc.).
 *
 * A rule set is an empty container on creation; add `SES.ReceiptRule`s to it
 * and point the account at it with `SES.ActiveReceiptRuleSet` to start
 * processing mail. Email receiving is only available in a subset of regions
 * (e.g. `us-east-1`, `us-west-2`, `eu-west-1`).
 * ### Creating Rule Sets
 * **Example:** Basic Rule Set
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const ruleSet = yield* SES.ReceiptRuleSet("Inbound", {});
 * ```
 *
 * **Example:** Named Rule Set
 * ```typescript
 * const ruleSet = yield* SES.ReceiptRuleSet("Inbound", {
 *   ruleSetName: "my-inbound-rules",
 * });
 * ```
 *
 * ### Activating a Rule Set
 * **Example:** Point the Account at a Rule Set
 * ```typescript
 * const ruleSet = yield* SES.ReceiptRuleSet("Inbound", {});
 * yield* SES.ActiveReceiptRuleSet("Active", {
 *   ruleSetName: ruleSet.ruleSetName,
 * });
 * ```
 *
 * @resource
 */
export declare const ReceiptRuleSet: import("../../Resource.ts").ResourceClass<ReceiptRuleSet>;
export declare const ReceiptRuleSetProvider: () => import("effect/Layer").Layer<Provider.Provider<ReceiptRuleSet>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ReceiptRuleSet.d.ts.map