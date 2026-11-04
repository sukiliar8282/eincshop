import * as Layer from "effect/Layer";
import { ListRules } from "./ListRules.ts";
/**
 * HTTP implementation of {@link ListRules}. At deploy time it grants
 * `events:ListRules`; at runtime it calls the EventBridge API with the host
 * Function's credentials. Provide this layer on the Function using the
 * binding.
 */
export declare const ListRulesHttp: Layer.Layer<ListRules, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListRulesHttp.d.ts.map