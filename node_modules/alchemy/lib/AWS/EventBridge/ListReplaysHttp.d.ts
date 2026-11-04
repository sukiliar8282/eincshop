import * as Layer from "effect/Layer";
import { ListReplays } from "./ListReplays.ts";
/**
 * HTTP implementation of {@link ListReplays}. At deploy time it grants
 * `events:ListReplays` (the action does not support resource-level
 * permissions); at runtime it calls the EventBridge API with the host
 * Function's credentials. Provide this layer on the Function using the
 * binding.
 */
export declare const ListReplaysHttp: Layer.Layer<ListReplays, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListReplaysHttp.d.ts.map