import * as Layer from "effect/Layer";
import { ListThings } from "./ListThings.ts";
/**
 * HTTP implementation of the {@link ListThings} capability — grants
 * `iot:ListThings` on `*` and calls the IoT `ListThings` API.
 */
export declare const ListThingsHttp: Layer.Layer<ListThings, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListThingsHttp.d.ts.map