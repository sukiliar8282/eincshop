import * as Layer from "effect/Layer";
import { TestEventPattern } from "./TestEventPattern.ts";
/**
 * HTTP implementation of {@link TestEventPattern}. At deploy time it grants
 * `events:TestEventPattern`; at runtime it calls the EventBridge API with the
 * host Function's credentials. Provide this layer on the Function using the
 * binding.
 */
export declare const TestEventPatternHttp: Layer.Layer<TestEventPattern, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=TestEventPatternHttp.d.ts.map