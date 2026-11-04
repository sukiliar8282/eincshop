import * as Layer from "effect/Layer";
import { ListRuleNamesByTarget } from "./ListRuleNamesByTarget.ts";
/**
 * HTTP implementation of {@link ListRuleNamesByTarget}. At deploy time it
 * grants `events:ListRuleNamesByTarget` (the action does not support
 * resource-level permissions); at runtime it calls the EventBridge API with
 * the host Function's credentials. Provide this layer on the Function using
 * the binding.
 */
export declare const ListRuleNamesByTargetHttp: Layer.Layer<ListRuleNamesByTarget, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListRuleNamesByTargetHttp.d.ts.map