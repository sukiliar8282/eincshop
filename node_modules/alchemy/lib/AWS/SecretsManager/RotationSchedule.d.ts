import * as secretsmanager from "@distilled.cloud/aws/secrets-manager";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RotationRules {
    /**
     * Rotate automatically after this interval (e.g. `"30 days"`). Rounded to
     * whole days on the wire (`AutomaticallyAfterDays`).
     */
    automaticallyAfter?: Duration.Input;
    /**
     * Length of the rotation window (e.g. `"3 hours"`). Rounded to whole
     * hours on the wire (`Duration`, `"3h"`).
     */
    window?: Duration.Input;
    /**
     * A `rate()` or `cron()` schedule expression, e.g. `"rate(4 hours)"` or
     * `"cron(0 8 1 * ? *)"`. Mutually exclusive with `automaticallyAfter`.
     */
    scheduleExpression?: string;
}
/** Convert the typed {@link RotationRules} to the wire shape. */
export declare const toWireRotationRules: (rules: RotationRules | undefined) => secretsmanager.RotationRulesType | undefined;
export interface RotationScheduleProps {
    /**
     * ARN (preferred) or name of the secret whose rotation is being
     * configured.
     */
    secretId: string;
    /**
     * ARN of the Lambda function that implements the rotation protocol
     * (`createSecret`/`setSecret`/`testSecret`/`finishSecret`).
     */
    rotationLambdaArn?: string;
    /**
     * When the rotation runs. Provide `scheduleExpression` or
     * `automaticallyAfter`.
     */
    rotationRules?: RotationRules;
    /**
     * Rotate the secret immediately when the schedule is created/updated. If
     * `false`, Secrets Manager only tests the rotation configuration by
     * running the `testSecret` step of the rotation function.
     * @default false
     */
    rotateImmediately?: boolean;
}
export interface RotationSchedule extends Resource<"AWS.SecretsManager.RotationSchedule", RotationScheduleProps, {
    /**
     * ARN of the secret the rotation is configured on.
     */
    secretArn: string;
    /**
     * Name of the secret.
     */
    secretName: string;
    /**
     * ARN of the rotation Lambda function.
     */
    rotationLambdaArn: string | undefined;
    /**
     * Whether automatic rotation is enabled on the secret.
     */
    rotationEnabled: boolean;
}, never, Providers> {
}
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
export declare const RotationSchedule: import("../../Resource.ts").ResourceClass<RotationSchedule>;
export declare const RotationScheduleProvider: () => import("effect/Layer").Layer<Provider.Provider<RotationSchedule>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=RotationSchedule.d.ts.map