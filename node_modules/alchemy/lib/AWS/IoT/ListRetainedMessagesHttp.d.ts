import * as Layer from "effect/Layer";
import { ListRetainedMessages } from "./ListRetainedMessages.ts";
/**
 * HTTP implementation of the {@link ListRetainedMessages} capability —
 * grants `iot:ListRetainedMessages` on `*` and calls the IoT data-plane
 * `ListRetainedMessages` API.
 */
export declare const ListRetainedMessagesHttp: Layer.Layer<ListRetainedMessages, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListRetainedMessagesHttp.d.ts.map