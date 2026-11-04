import * as Layer from "effect/Layer";
import { DescribeEventBus } from "./DescribeEventBus.ts";
/**
 * HTTP implementation of {@link DescribeEventBus}. At deploy time it grants
 * `events:DescribeEventBus` on the bound bus; at runtime it calls the
 * EventBridge API with the host Function's credentials. Provide this layer on
 * the Function using the binding.
 */
export declare const DescribeEventBusHttp: Layer.Layer<DescribeEventBus, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=DescribeEventBusHttp.d.ts.map