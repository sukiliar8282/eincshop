import * as Layer from "effect/Layer";
import { ListSubscriptions } from "./ListSubscriptions.ts";
/**
 * HTTP implementation of the {@link ListSubscriptions} capability — grants
 * `iot:ListSubscriptions` on the bound client filter and calls the IoT
 * data-plane `ListSubscriptions` API.
 */
export declare const ListSubscriptionsHttp: Layer.Layer<ListSubscriptions, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListSubscriptionsHttp.d.ts.map