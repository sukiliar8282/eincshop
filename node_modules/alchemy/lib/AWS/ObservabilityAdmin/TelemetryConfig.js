import * as obs from "@distilled.cloud/aws/observabilityadmin";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * Account-level CloudWatch **telemetry config** (Observability Admin
 * telemetry evaluation) — an account singleton that audits which AWS
 * resources (VPCs, Lambda functions, ...) have telemetry such as flow
 * logs enabled.
 *
 * This is an always-present account *setting*, not a discrete resource:
 * deploying it onboards the account, and destroying it restores whatever
 * onboarding state the account had before the stack first managed it.
 *
 * ### Managing telemetry config
 * **Example:** Onboard the account
 * ```typescript
 * import * as ObservabilityAdmin from "alchemy/AWS/ObservabilityAdmin";
 *
 * const telemetry = yield* ObservabilityAdmin.TelemetryConfig("Telemetry");
 * ```
 *
 * **Example:** Keep the resource but switch the feature off
 * ```typescript
 * const telemetry = yield* ObservabilityAdmin.TelemetryConfig("Telemetry", {
 *   enabled: false,
 * });
 * ```
 *
 * @resource
 */
export const TelemetryConfig = Resource("AWS.ObservabilityAdmin.TelemetryConfig");
/**
 * Raised when the telemetry config feature reports `FAILED_START` /
 * `FAILED_STOP`, or fails to converge within the bounded wait.
 */
export class TelemetryConfigTransitionFailed extends Data.TaggedError("TelemetryConfigTransitionFailed") {
}
const readStatus = obs
    .getTelemetryEvaluationStatus({})
    .pipe(Effect.map((r) => r.Status ?? "NOT_STARTED"));
const ON_STATES = ["RUNNING", "STARTING"];
/**
 * Poll the evaluation status on a bounded schedule until it reaches a
 * settled state (start/stop completed in ~1s in probing; the bound is
 * defensive). Explicitly typed at module scope so the conditional types of
 * `Effect.repeat` never leak into the provider layer's declaration emit.
 */
const awaitSettledStatus = readStatus.pipe(Effect.repeat({
    schedule: Schedule.max([Schedule.fixed("2 seconds"), Schedule.recurs(10)]),
    until: (status) => status !== "STARTING" && status !== "STOPPING",
}));
const failIfUnsettled = (status, transition) => status === "STARTING" || status === "STOPPING" || status.startsWith("FAILED")
    ? Effect.fail(new TelemetryConfigTransitionFailed({
        message: `telemetry evaluation did not settle after ${transition} (status: ${status})`,
        status,
    }))
    : Effect.succeed(status);
/**
 * One idempotent convergence step shared by reconcile and delete-restore:
 * observe the live status and start/stop only on an actual delta.
 */
const convergeTo = Effect.fn(function* (desiredOn) {
    const observed = yield* awaitSettledStatus;
    const isOn = ON_STATES.includes(observed);
    if (desiredOn && !isOn) {
        yield* obs.startTelemetryEvaluation({});
        return yield* failIfUnsettled(yield* awaitSettledStatus, "start");
    }
    if (!desiredOn && isOn) {
        yield* obs.stopTelemetryEvaluation({});
        return yield* failIfUnsettled(yield* awaitSettledStatus, "stop");
    }
    return observed;
});
export const TelemetryConfigProvider = () => Provider.effect(TelemetryConfig, Effect.gen(function* () {
    return TelemetryConfig.Provider.of({
        // Account singleton setting — deleting only restores the prior
        // onboarding state; nuke must not toggle it.
        nuke: { singleton: true },
        stables: ["priorStatus"],
        // No enumeration API — the singleton is always present as account
        // configuration, never a discrete listable resource.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ output }) {
            const status = yield* readStatus;
            return {
                status,
                priorStatus: output?.priorStatus ?? status,
            };
        }),
        reconcile: Effect.fn(function* ({ news, output, session }) {
            // Capture the pre-management status exactly once so destroy can
            // restore it; on later updates the persisted capture wins.
            const priorStatus = output?.priorStatus ?? (yield* readStatus);
            const desiredOn = news.enabled !== false;
            const status = yield* convergeTo(desiredOn);
            yield* session.note(`telemetry evaluation ${status}`);
            return { status, priorStatus };
        }),
        delete: Effect.fn(function* ({ output, session }) {
            // Restore the captured pre-management state instead of blindly
            // stopping: an account that was already onboarded before this
            // stack managed it stays onboarded.
            const priorOn = ON_STATES.includes(output.priorStatus);
            const status = yield* convergeTo(priorOn);
            yield* session.note(`telemetry evaluation restored to ${status}`);
        }),
    });
}));
//# sourceMappingURL=TelemetryConfig.js.map