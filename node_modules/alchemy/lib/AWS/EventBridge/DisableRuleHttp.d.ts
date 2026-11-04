import * as Layer from "effect/Layer";
import { DisableRule } from "./DisableRule.ts";
/**
 * HTTP implementation of {@link DisableRule}. At deploy time it grants
 * `events:DisableRule` on the bound rule; at runtime it calls the EventBridge
 * API with the host Function's credentials. Provide this layer on the
 * Function using the binding.
 */
export declare const DisableRuleHttp: Layer.Layer<DisableRule, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=DisableRuleHttp.d.ts.map