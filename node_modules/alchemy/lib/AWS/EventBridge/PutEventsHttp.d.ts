import * as Layer from "effect/Layer";
import { PutEvents } from "./PutEvents.ts";
/**
 * HTTP implementation of {@link PutEvents}. At deploy time it grants
 * `events:PutEvents` on the bound bus (or the default bus); at runtime it
 * calls the EventBridge API with the host Function's credentials. Provide
 * this layer on the Function using the binding.
 */
export declare const PutEventsHttp: Layer.Layer<PutEvents, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=PutEventsHttp.d.ts.map