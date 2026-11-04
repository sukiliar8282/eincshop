import * as Layer from "effect/Layer";
import { RotationEventSource as SecretsManagerRotationEventSource, type SecretRotationEvent } from "../SecretsManager/RotationEventSource.ts";
import * as Lambda from "./Function.ts";
/**
 * Narrow an arbitrary Lambda invocation payload to a Secrets Manager
 * rotation event (`createSecret`/`setSecret`/`testSecret`/`finishSecret`).
 *
 * `ClientRequestToken` is deliberately NOT required: the validation
 * invocation Secrets Manager performs when a rotation schedule is
 * configured with `RotateImmediately: false` can arrive without one, and an
 * unmatched event fails the whole invocation ("No event handler found"),
 * which Secrets Manager records as a failed rotation attempt.
 */
export declare const isSecretRotationEvent: (event: any) => event is SecretRotationEvent;
/**
 * Lambda runtime implementation for
 * `AWS.SecretsManager.onSecretRotation(...)`.
 *
 * This layer does three things at deploy time:
 *
 * 1. Grants `secretsmanager.amazonaws.com` permission to invoke the current
 *    function (scoped to this account via `aws:SourceAccount`).
 * 2. Attaches the rotation-protocol IAM actions for the bound secret
 *    (`DescribeSecret`, `GetSecretValue`, `PutSecretValue`,
 *    `UpdateSecretVersionStage` on the secret + `GetRandomPassword`).
 * 3. Provisions the {@link RotationSchedule} configuring the secret's
 *    rotation to invoke this function — threaded through the Permission so
 *    Secrets Manager's invoke-permission validation passes.
 *
 * At runtime it narrows incoming invocations to rotation events for the
 * bound secret and forwards them to the supplied handler.
 * ### Rotating Secrets
 * **Example:** Handle Rotation Steps
 * ```typescript
 * yield* SecretsManager.onSecretRotation(
 *   secret,
 *   { rotationRules: { automaticallyAfter: "30 days" } },
 *   (event) => rotate(event).pipe(Effect.orDie),
 * );
 * ```
 *
 * @binding
 */
export declare const SecretRotationEventSource: Layer.Layer<SecretsManagerRotationEventSource, never, Lambda.Function>;
//# sourceMappingURL=SecretRotationEventSource.d.ts.map