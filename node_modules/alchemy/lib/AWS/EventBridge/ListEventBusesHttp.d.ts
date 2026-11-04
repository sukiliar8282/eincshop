import * as Layer from "effect/Layer";
import { ListEventBuses } from "./ListEventBuses.ts";
/**
 * HTTP implementation of {@link ListEventBuses}. At deploy time it grants
 * `events:ListEventBuses`; at runtime it calls the EventBridge API with the
 * host Function's credentials. Provide this layer on the Function using the
 * binding.
 */
export declare const ListEventBusesHttp: Layer.Layer<ListEventBuses, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListEventBusesHttp.d.ts.map