import * as Layer from "effect/Layer";
import { DescribeThing } from "./DescribeThing.ts";
/**
 * HTTP implementation of the {@link DescribeThing} capability — grants
 * `iot:DescribeThing` on the thing ARN and calls the IoT `DescribeThing`
 * API.
 */
export declare const DescribeThingHttp: Layer.Layer<DescribeThing, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=DescribeThingHttp.d.ts.map