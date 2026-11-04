import * as Layer from "effect/Layer";
import { ListTargetsByRule } from "./ListTargetsByRule.ts";
/**
 * HTTP implementation of {@link ListTargetsByRule}. At deploy time it grants
 * `events:ListTargetsByRule` on the bound rule; at runtime it calls the
 * EventBridge API with the host Function's credentials. Provide this layer on
 * the Function using the binding.
 */
export declare const ListTargetsByRuleHttp: Layer.Layer<ListTargetsByRule, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListTargetsByRuleHttp.d.ts.map