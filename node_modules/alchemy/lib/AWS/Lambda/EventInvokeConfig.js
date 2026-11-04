import * as Lambda from "@distilled.cloud/aws/lambda";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { deepEqual } from "../../Diff.js";
import { toWireSeconds } from "../../Util/Duration.js";
const DEFAULT_MAXIMUM_RETRY_ATTEMPTS = 2;
const DEFAULT_MAXIMUM_EVENT_AGE_SECONDS = 21_600;
const retryOnConflict = (effect) => effect.pipe(Effect.retry({
    while: (e) => e._tag === "ResourceConflictException",
    schedule: Schedule.max([Schedule.exponential(500), Schedule.recurs(10)]),
}));
const normalizeDestinationConfig = (config) => {
    const onSuccess = config?.OnSuccess?.Destination
        ? { Destination: config.OnSuccess.Destination }
        : undefined;
    const onFailure = config?.OnFailure?.Destination
        ? { Destination: config.OnFailure.Destination }
        : undefined;
    return onSuccess || onFailure
        ? {
            OnSuccess: onSuccess,
            OnFailure: onFailure,
        }
        : undefined;
};
const observeConfig = (functionName, qualifier) => Lambda.getFunctionEventInvokeConfig({
    FunctionName: functionName,
    Qualifier: qualifier,
}).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
/**
 * Converge the async invocation config of a function or alias to the desired
 * state: put it when set, delete it when omitted. Diffs against the observed
 * cloud config so a no-op deploy skips the write entirely.
 */
export const syncEventInvokeConfig = Effect.fn(function* ({ functionName, qualifier, config, }) {
    const observed = yield* observeConfig(functionName, qualifier);
    if (config === undefined) {
        if (observed) {
            yield* retryOnConflict(Lambda.deleteFunctionEventInvokeConfig({
                FunctionName: functionName,
                Qualifier: qualifier,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }
        return;
    }
    const desired = {
        maximumRetryAttempts: config.maximumRetryAttempts ?? DEFAULT_MAXIMUM_RETRY_ATTEMPTS,
        maximumEventAgeSeconds: toWireSeconds(config.maximumEventAge) ??
            DEFAULT_MAXIMUM_EVENT_AGE_SECONDS,
        destinationConfig: normalizeDestinationConfig(config.destinationConfig),
    };
    if (observed &&
        (observed.MaximumRetryAttempts ?? DEFAULT_MAXIMUM_RETRY_ATTEMPTS) ===
            desired.maximumRetryAttempts &&
        (observed.MaximumEventAgeInSeconds ?? DEFAULT_MAXIMUM_EVENT_AGE_SECONDS) ===
            desired.maximumEventAgeSeconds &&
        deepEqual(normalizeDestinationConfig(observed.DestinationConfig), desired.destinationConfig)) {
        return;
    }
    yield* Lambda.putFunctionEventInvokeConfig({
        FunctionName: functionName,
        Qualifier: qualifier,
        MaximumRetryAttempts: desired.maximumRetryAttempts,
        MaximumEventAgeInSeconds: desired.maximumEventAgeSeconds,
        DestinationConfig: desired.destinationConfig,
    }).pipe(Effect.retry({
        while: (e) => e._tag === "ResourceConflictException" ||
            // Destination validation races IAM policy propagation on the
            // execution role — Lambda rejects the put until the role can reach
            // the destination.
            (e._tag === "InvalidParameterValueException" &&
                (e.message?.includes("The function execution role does not have permissions to call") ??
                    false)),
        schedule: Schedule.max([Schedule.exponential(500), Schedule.recurs(10)]),
    }));
});
//# sourceMappingURL=EventInvokeConfig.js.map