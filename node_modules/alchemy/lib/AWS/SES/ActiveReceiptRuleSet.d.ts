import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ActiveReceiptRuleSetProps {
    /**
     * Name of the receipt rule set to make active for the account in the current
     * region. Typically the `ruleSetName` output of a `SES.ReceiptRuleSet`.
     * Re-pointing to a different rule set updates the active pointer in place.
     */
    ruleSetName: string;
}
export interface ActiveReceiptRuleSet extends Resource<"AWS.SES.ActiveReceiptRuleSet", ActiveReceiptRuleSetProps, {
    /** Name of the rule set that is active for the account. */
    ruleSetName: string;
}, never, Providers> {
}
/**
 * The account's active Amazon SES receipt rule set — the single rule set (per
 * account, per region) that SES actually evaluates against inbound mail.
 *
 * This is an account-level singleton pointer, not a container: only one rule
 * set can be active at a time. Deleting this resource deactivates email
 * receiving (clears the pointer) only when the account is still pointed at the
 * rule set this resource set; if something else has since become active, the
 * delete is a no-op.
 * ### Activating a Rule Set
 * **Example:** Make a Rule Set Active
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const ruleSet = yield* SES.ReceiptRuleSet("Inbound", {});
 * const active = yield* SES.ActiveReceiptRuleSet("Active", {
 *   ruleSetName: ruleSet.ruleSetName,
 * });
 * ```
 *
 * @resource
 */
export declare const ActiveReceiptRuleSet: import("../../Resource.ts").ResourceClass<ActiveReceiptRuleSet>;
export declare const ActiveReceiptRuleSetProvider: () => import("effect/Layer").Layer<Provider.Provider<ActiveReceiptRuleSet>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ActiveReceiptRuleSet.d.ts.map