import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface ActionTargetProps {
    /**
     * Display name of the custom action (shown in the Security Hub console's
     * action menu, max 20 characters). Updatable in place.
     */
    name: string;
    /**
     * Description of the custom action. Updatable in place.
     */
    description: string;
    /**
     * ID of the custom action (alphanumeric, max 20 characters). It becomes the
     * final segment of the action target ARN. If omitted, a unique id is
     * generated. Changing this replaces the action target.
     */
    id?: string;
}
/** @resource */
export interface ActionTarget extends Resource<"AWS.SecurityHub.ActionTarget", ActionTargetProps, {
    /** ARN of the action target (`…:action/custom/{id}`). */
    actionTargetArn: string;
    /** ID of the custom action (final ARN segment). */
    id: string;
    /** Display name of the custom action. */
    name: string;
    /** Description of the custom action. */
    description: string;
}, never, Providers> {
}
/**
 * A Security Hub custom action target. Selecting the custom action on
 * findings or insights in the console publishes a
 * `Security Hub Findings - Custom Action` event to EventBridge, which a
 * Function can consume via {@link consumeCustomActions}.
 *
 * ### Creating a Custom Action
 * **Example:** Send Findings to a Triage Function
 * ```typescript
 * const action = yield* AWS.SecurityHub.ActionTarget("Escalate", {
 *   name: "Escalate",
 *   description: "Escalate the selected findings to on-call",
 * });
 * ```
 *
 * **Example:** Consume Custom Action Events
 * ```typescript
 * yield* AWS.SecurityHub.consumeCustomActions(
 *   { actionArns: [action.actionTargetArn] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(event.detail.findings),
 *     ),
 * );
 * ```
 */
declare const ActionTargetResource: import("../../Resource.ts").ResourceClass<ActionTarget>;
export { ActionTargetResource as ActionTarget };
export declare const ActionTargetProvider: () => import("effect/Layer").Layer<Provider.Provider<ActionTarget>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ActionTarget.d.ts.map