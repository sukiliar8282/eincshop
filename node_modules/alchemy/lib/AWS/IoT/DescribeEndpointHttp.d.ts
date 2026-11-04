import * as Layer from "effect/Layer";
import { DescribeEndpoint } from "./DescribeEndpoint.ts";
/**
 * HTTP implementation of the {@link DescribeEndpoint} capability — grants
 * `iot:DescribeEndpoint` on `*` and calls the IoT `DescribeEndpoint` API.
 */
export declare const DescribeEndpointHttp: Layer.Layer<DescribeEndpoint, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=DescribeEndpointHttp.d.ts.map