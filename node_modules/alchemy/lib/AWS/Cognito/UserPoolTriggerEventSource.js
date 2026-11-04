import * as Binding from "../../Binding.js";
/**
 * The `triggerSource` prefix Cognito stamps on invocations of each trigger
 * slot (e.g. `PreSignUp` fires with `PreSignUp_SignUp`,
 * `PreSignUp_AdminCreateUser`, …; `PreTokenGeneration` fires with
 * `TokenGeneration_*`). Used by the runtime dispatcher to route events to
 * the registered handler.
 */
export const userPoolTriggerSourcePrefixes = {
    PreSignUp: "PreSignUp_",
    PostConfirmation: "PostConfirmation_",
    PreAuthentication: "PreAuthentication_",
    PostAuthentication: "PostAuthentication_",
    CustomMessage: "CustomMessage_",
    DefineAuthChallenge: "DefineAuthChallenge_",
    CreateAuthChallenge: "CreateAuthChallenge_",
    VerifyAuthChallengeResponse: "VerifyAuthChallengeResponse_",
    PreTokenGeneration: "TokenGeneration_",
    UserMigration: "UserMigration_",
};
export const UserPoolTriggerEventSource = Binding.Service("AWS.Cognito.UserPoolTriggerEventSource");
/**
 * Handle a Cognito user pool Lambda trigger with the current Lambda
 * function.
 *
 * Provide `Lambda.UserPoolTriggerEventSource` on the hosting function to
 * satisfy the requirement.
 *
 * @param userPool The user pool whose trigger to handle.
 * @param props The trigger slot to handle.
 * @param handler Invoked once per trigger event; the returned event is the
 * response Cognito receives.
 *
 * @example Auto-confirm every sign-up
 * ```typescript
 * yield* Cognito.onUserPoolTrigger(pool, { trigger: "PreSignUp" }, (event) =>
 *   Effect.sync(() => Cognito.autoConfirmUser(event, { verifyEmail: true })),
 * );
 * ```
 */
export function onUserPoolTrigger(userPool, props, handler) {
    return UserPoolTriggerEventSource.use((source) => source(userPool, props, handler));
}
/**
 * Handle the `PreSignUp` trigger — runs before Cognito registers a new
 * user; the handler can auto-confirm the user (see
 * {@link autoConfirmUser}) or reject the sign-up.
 */
export const onPreSignUp = (userPool, handler) => onUserPoolTrigger(userPool, { trigger: "PreSignUp" }, handler);
/**
 * Handle the `PostConfirmation` trigger — runs after a user confirms their
 * account (welcome emails, provisioning rows, analytics).
 */
export const onPostConfirmation = (userPool, handler) => onUserPoolTrigger(userPool, { trigger: "PostConfirmation" }, handler);
/**
 * Handle the `PreTokenGeneration` trigger — runs before Cognito issues
 * tokens; the handler can add, override, or suppress claims via
 * `event.response.claimsOverrideDetails`.
 */
export const onPreTokenGeneration = (userPool, handler) => onUserPoolTrigger(userPool, { trigger: "PreTokenGeneration" }, handler);
/**
 * Handle the `CustomMessage` trigger — customizes the verification /
 * invitation messages Cognito sends by mutating
 * `event.response.emailSubject` / `emailMessage` / `smsMessage`.
 */
export const onCustomMessage = (userPool, handler) => onUserPoolTrigger(userPool, { trigger: "CustomMessage" }, handler);
/**
 * Mutate a `PreSignUp` trigger event's response to auto-confirm the user
 * (and optionally auto-verify their email / phone number), then return the
 * event so it can be handed straight back to Cognito.
 *
 * @example Sign-ups arrive CONFIRMED, no confirmation code required
 * ```typescript
 * yield* Cognito.onPreSignUp(pool, (event) =>
 *   Effect.sync(() => Cognito.autoConfirmUser(event, { verifyEmail: true })),
 * );
 * ```
 */
export const autoConfirmUser = (event, options) => {
    event.response.autoConfirmUser = true;
    if (options?.verifyEmail === true) {
        event.response.autoVerifyEmail = true;
    }
    if (options?.verifyPhone === true) {
        event.response.autoVerifyPhone = true;
    }
    return event;
};
//# sourceMappingURL=UserPoolTriggerEventSource.js.map