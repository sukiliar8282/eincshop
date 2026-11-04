import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface ActivityProps {
    /**
     * Name of the activity (1-80 characters; letters, digits, dashes and
     * underscores). If omitted, a deterministic physical name is generated
     * from the app, stage, and logical ID. Changing the name triggers a
     * replacement.
     */
    activityName?: string;
    /**
     * Tags to apply to the activity. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Activity extends Resource<"AWS.StepFunctions.Activity", ActivityProps, {
    /**
     * Physical name of the activity.
     */
    activityName: string;
    /**
     * ARN of the activity — reference it from a state machine Task state's
     * `Resource` field.
     */
    activityArn: string;
}, never, Providers> {
}
/**
 * An AWS Step Functions activity — a named endpoint that external workers
 * poll for tasks (`GetActivityTask`) and complete with the `SendTask*`
 * callback operations.
 *
 * Activities support worker-hosted task processing outside Lambda. For
 * most callback flows the `.waitForTaskToken` service-integration pattern
 * on a {@link StateMachine} Task state is preferred.
 * ### Creating Activities
 * **Example:** Basic Activity
 * ```typescript
 * import * as StepFunctions from "alchemy/AWS/StepFunctions";
 *
 * const activity = yield* StepFunctions.Activity("ApprovalActivity");
 * ```
 *
 * **Example:** Reference an Activity from a State Machine
 * ```typescript
 * const machine = yield* StepFunctions.StateMachine("ApprovalFlow", {
 *   definition: {
 *     StartAt: "WaitForWorker",
 *     States: {
 *       WaitForWorker: {
 *         Type: "Task",
 *         Resource: activity.activityArn,
 *         End: true,
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * ### Completing Tasks at Runtime
 * **Example:** Send a task result scoped to the activity
 * ```typescript
 * // init
 * const sendTaskSuccess = yield* StepFunctions.SendTaskSuccess(activity);
 *
 * // runtime
 * yield* sendTaskSuccess({
 *   taskToken: token,
 *   output: JSON.stringify({ approved: true }),
 * });
 * ```
 *
 * @resource
 */
export declare const Activity: import("../../Resource.ts").ResourceClass<Activity>;
export declare const ActivityProvider: () => import("effect/Layer").Layer<Provider.Provider<Activity>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Activity.d.ts.map