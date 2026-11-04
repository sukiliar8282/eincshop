import * as Layer from "effect/Layer";
import { CancelReplay } from "./CancelReplay.ts";
/**
 * HTTP implementation of {@link CancelReplay}. At deploy time it grants
 * `events:CancelReplay` on the account's replays; at runtime it calls the
 * EventBridge API with the host Function's credentials. Provide this layer
 * on the Function using the binding.
 */
export declare const CancelReplayHttp: Layer.Layer<CancelReplay, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=CancelReplayHttp.d.ts.map