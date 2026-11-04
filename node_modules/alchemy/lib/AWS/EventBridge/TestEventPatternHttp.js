import * as eventbridge from "@distilled.cloud/aws/eventbridge";
import * as Layer from "effect/Layer";
import { makeEventBridgeAccountHttpBinding } from "./BindingHttp.js";
import { TestEventPattern } from "./TestEventPattern.js";
/**
 * HTTP implementation of {@link TestEventPattern}. At deploy time it grants
 * `events:TestEventPattern`; at runtime it calls the EventBridge API with the
 * host Function's credentials. Provide this layer on the Function using the
 * binding.
 */
export const TestEventPatternHttp = Layer.effect(TestEventPattern, makeEventBridgeAccountHttpBinding({
    tag: "AWS.EventBridge.TestEventPattern",
    operation: eventbridge.testEventPattern,
    actions: ["events:TestEventPattern"],
}));
//# sourceMappingURL=TestEventPatternHttp.js.map