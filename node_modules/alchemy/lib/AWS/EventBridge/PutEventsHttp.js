import * as eventbridge from "@distilled.cloud/aws/eventbridge";
import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.js";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { AWSEnvironment } from "../Environment.js";
import { isBindingHost } from "../Lambda/Function.js";
import { PutEvents } from "./PutEvents.js";
/**
 * HTTP implementation of {@link PutEvents}. At deploy time it grants
 * `events:PutEvents` on the bound bus (or the default bus); at runtime it
 * calls the EventBridge API with the host Function's credentials. Provide
 * this layer on the Function using the binding.
 */
export const PutEventsHttp = Layer.effect(PutEvents, Effect.gen(function* () {
    const putEvents = yield* eventbridge.putEvents;
    return Effect.fn(function* (bus) {
        const EventBusName = bus ? yield* bus.eventBusName : undefined;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                const { accountId, region } = yield* AWSEnvironment.current;
                // Pass the ARN as an unresolved Output — binding data is resolved
                // by the engine before the host reconciles. Eagerly yielding here
                // (during plan) produces a deferred object that serializes into an
                // invalid IAM policy (MalformedPolicyDocumentException).
                const resource = bus
                    ? Output.interpolate `${bus.eventBusArn}`
                    : `arn:aws:events:${region}:${accountId}:event-bus/default`;
                yield* host.bind `Allow(${host}, AWS.EventBridge.PutEvents(${bus ?? "default"}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["events:PutEvents"],
                            Resource: [resource],
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.EventBridge.PutEvents(${bus?.LogicalId})`)(function* (request) {
            const eventBusName = EventBusName ? yield* EventBusName : undefined;
            return yield* putEvents({
                ...request,
                Entries: request.Entries.map((entry) => ({
                    ...entry,
                    EventBusName: eventBusName && eventBusName !== "default"
                        ? eventBusName
                        : undefined,
                })),
            });
        });
    });
}));
//# sourceMappingURL=PutEventsHttp.js.map