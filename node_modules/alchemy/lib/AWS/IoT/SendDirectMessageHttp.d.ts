import * as Layer from "effect/Layer";
import { SendDirectMessage } from "./SendDirectMessage.ts";
/**
 * HTTP implementation of the {@link SendDirectMessage} capability — grants
 * `iot:SendDirectMessage` on the bound client filter and calls the IoT
 * data-plane `SendDirectMessage` API.
 */
export declare const SendDirectMessageHttp: Layer.Layer<SendDirectMessage, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=SendDirectMessageHttp.d.ts.map