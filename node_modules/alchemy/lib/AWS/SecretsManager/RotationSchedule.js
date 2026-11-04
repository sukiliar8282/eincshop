import * as secretsmanager from "@distilled.cloud/aws/secrets-manager";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { toWireDays, toWireHours } from "../../Util/Duration.js";
/** Convert the typed {@link RotationRules} to the wire shape. */
export const toWireRotationRules = (rules) => {
    if (rules === undefined) {
        return undefined;
    }
    const hours = toWireHours(rules.window);
    return {
        AutomaticallyAfterDays: toWireDays(rules.automaticallyAfter),
        Duration: hours === undefined ? undefined : `${hours}h`,
        ScheduleExpression: rules.scheduleExpression,
    };
};
/**
 * Configures automatic rotation on a Secrets Manager secret
 * (`RotateSecret` with a rotation Lambda + rules; `CancelRotateSecret` on
 * delete).
 *
 * Usually created for you by {@link onSecretRotation}, which also wires the
 * invoke permission and the runtime handler — reach for the resource
 * directly only when the rotation function is managed outside the current
 * stack.
 * ### Scheduling Rotation
 * **Example:** Rotate Every 30 Days
 * ```typescript
 * const schedule = yield* RotationSchedule("DbSecretRotation", {
 *   secretId: secret.secretArn,
 *   rotationLambdaArn: rotationFunctionArn,
 *   rotationRules: { automaticallyAfter: "30 days" },
 * });
 * ```
 *
 * **Example:** Cron Schedule with a Rotation Window
 * ```typescript
 * const schedule = yield* RotationSchedule("DbSecretRotation", {
 *   secretId: secret.secretArn,
 *   rotationLambdaArn: rotationFunctionArn,
 *   rotationRules: {
 *     scheduleExpression: "cron(0 8 1 * ? *)",
 *     window: "3 hours",
 *   },
 * });
 * ```
 *
 * @resource
 */
export const RotationSchedule = Resource("AWS.SecretsManager.RotationSchedule");
/**
 * Bounded retry while Secrets Manager can't yet invoke the rotation Lambda
 * (`InvalidRequestException` — the `lambda:InvokeFunction` permission for
 * principal `secretsmanager.amazonaws.com` propagates asynchronously right
 * after it is created).
 *
 * Explicitly-typed helper: inlining `Effect.retry` here leaves
 * `Retry.Return`'s conditional type unresolved in the provider's inferred
 * layer type, which declaration emit widens to an `unknown` R — poisoning
 * `AWS.providers()` for every consumer (same shape as in `Secret.ts`).
 */
const retryWhileInvokePermissionPropagates = (self) => Effect.retry(self, {
    while: (e) => e._tag === "InvalidRequestException" &&
        (e.message?.includes("Lambda") ?? false),
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(10)]),
});
export const RotationScheduleProvider = () => Provider.effect(RotationSchedule, Effect.gen(function* () {
    const readRotation = Effect.fn(function* (secretId) {
        return yield* secretsmanager
            .describeSecret({ SecretId: secretId })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return {
        stables: ["secretArn", "secretName"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            if (olds && olds.secretId !== news.secretId) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const secretId = output?.secretArn ?? olds?.secretId;
            if (secretId === undefined) {
                return undefined;
            }
            const described = yield* readRotation(secretId);
            if (!described?.ARN ||
                !described.Name ||
                !described.RotationEnabled) {
                return undefined;
            }
            return {
                secretArn: described.ARN,
                secretName: described.Name,
                rotationLambdaArn: described.RotationLambdaARN,
                rotationEnabled: described.RotationEnabled === true,
            };
        }),
        reconcile: Effect.fn(function* ({ news, output, session }) {
            const secretId = output?.secretArn ?? news.secretId;
            // Configure (or reconverge) rotation. `rotateSecret` is a true
            // upsert of the rotation configuration; with
            // `RotateImmediately: false` Secrets Manager only validates the
            // config by invoking the rotation function's `testSecret` step.
            // Right after the invoke permission is created Secrets Manager may
            // not see it yet — retry through that propagation window.
            const rotated = yield* retryWhileInvokePermissionPropagates(secretsmanager.rotateSecret({
                SecretId: secretId,
                RotationLambdaARN: news.rotationLambdaArn,
                RotationRules: toWireRotationRules(news.rotationRules),
                RotateImmediately: news.rotateImmediately ?? false,
            }));
            const secretArn = rotated.ARN ?? secretId;
            const described = yield* readRotation(secretArn);
            yield* session.note(secretArn);
            return {
                secretArn: described?.ARN ?? secretArn,
                secretName: described?.Name ?? rotated.Name ?? secretId,
                rotationLambdaArn: described?.RotationLambdaARN ?? news.rotationLambdaArn,
                rotationEnabled: described?.RotationEnabled === true,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // `CancelRotateSecret` turns off automatic rotation (and cancels
            // any rotation in progress). Idempotent: missing secret or
            // rotation-not-configured are treated as already-deleted.
            yield* secretsmanager
                .cancelRotateSecret({ SecretId: output.secretArn })
                .pipe(Effect.catchTag(["ResourceNotFoundException", "InvalidRequestException"], () => Effect.void));
        }),
        // A rotation schedule is configuration on a secret, not a separately
        // enumerable object — `listSecrets` surfaces the rotation state
        // (`RotationEnabled`, `RotationLambdaARN`) inline, so hydrate the
        // exact `read` Attributes shape for every secret that has rotation
        // enabled.
        list: () => secretsmanager.listSecrets.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.SecretList ?? [])
            .filter((entry) => entry.ARN != null &&
            entry.Name != null &&
            entry.RotationEnabled === true)
            .map((entry) => ({
            secretArn: entry.ARN,
            secretName: entry.Name,
            rotationLambdaArn: entry.RotationLambdaARN,
            rotationEnabled: true,
        }))))),
    };
}));
//# sourceMappingURL=RotationSchedule.js.map