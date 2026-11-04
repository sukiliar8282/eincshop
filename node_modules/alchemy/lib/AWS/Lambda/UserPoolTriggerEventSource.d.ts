import * as Layer from "effect/Layer";
import { UserPoolTriggerEventSource as CognitoUserPoolTriggerEventSource } from "../Cognito/UserPoolTriggerEventSource.ts";
import * as Lambda from "./Function.ts";
/**
 * The `version`/`triggerSource`/`userPoolId`/`request`/`response` envelope
 * shared by every user pool Lambda trigger. Declared structurally —
 * `@types/aws-lambda` keeps `BaseTriggerEvent` in an internal `_common`
 * module that its package root does not re-export.
 */
export interface UserPoolTriggerEnvelope {
    version: string;
    triggerSource: string;
    region: string;
    userPoolId: string;
    userName?: string;
    request: Record<string, unknown>;
    response: Record<string, unknown>;
}
/**
 * A Cognito user pool trigger invocation — the
 * `version`/`triggerSource`/`userPoolId`/`request`/`response` envelope
 * shared by every user pool Lambda trigger.
 */
export declare const isUserPoolTriggerEvent: (event: any) => event is UserPoolTriggerEnvelope;
/**
 * Connects a Cognito user pool Lambda trigger to the current Lambda
 * function.
 *
 * At deploy time this layer injects the function ARN into the pool's
 * `LambdaConfig` through the pool's binding contract and materializes the
 * `lambda:InvokeFunction` Permission for `cognito-idp.amazonaws.com`; at
 * runtime it dispatches matching trigger events (matched on `userPoolId` +
 * `triggerSource` prefix) to the registered handler and returns the
 * handler's (mutated) event to Cognito.
 * ### Handling user pool triggers
 * **Example:** Auto-confirm sign-ups
 * ```typescript
 * yield* Cognito.onPreSignUp(pool, (event) =>
 *   Effect.sync(() => Cognito.autoConfirmUser(event, { verifyEmail: true })),
 * );
 * ```
 *
 * @binding
 */
export declare const UserPoolTriggerEventSource: Layer.Layer<CognitoUserPoolTriggerEventSource, never, Lambda.Function>;
//# sourceMappingURL=UserPoolTriggerEventSource.d.ts.map