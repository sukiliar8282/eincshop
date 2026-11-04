import * as Layer from "effect/Layer";
import { ListNamedShadowsForThing } from "./ListNamedShadowsForThing.ts";
/**
 * HTTP implementation of the {@link ListNamedShadowsForThing} capability —
 * grants `iot:ListNamedShadowsForThing` on the thing ARN and calls the IoT
 * data-plane `ListNamedShadowsForThing` API.
 */
export declare const ListNamedShadowsForThingHttp: Layer.Layer<ListNamedShadowsForThing, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListNamedShadowsForThingHttp.d.ts.map