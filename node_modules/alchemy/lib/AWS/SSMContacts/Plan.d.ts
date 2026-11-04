import * as contacts from "@distilled.cloud/aws/ssm-contacts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PlanProps {
    /**
     * The ARN of the contact or escalation plan whose engagement plan this
     * resource manages. Changing it replaces the plan.
     */
    contactId: string;
    /**
     * The stages that Incident Manager runs through when engaging the contact:
     * each stage has a duration and a set of channel/contact targets.
     */
    stages?: contacts.Stage[];
    /**
     * ARNs of the on-call rotations associated with the plan (only valid for
     * `ONCALL_SCHEDULE` contacts).
     */
    rotationIds?: string[];
}
/** @resource */
export interface Plan extends Resource<"AWS.SSMContacts.Plan", PlanProps, {
    /** ARN of the contact whose engagement plan is managed. */
    contactArn: string;
    /** Number of stages in the plan. */
    stageCount: number;
}, never, Providers> {
}
/**
 * The engagement plan of an Incident Manager contact — the staged sequence
 * of contact channels (for `PERSONAL` contacts), contacts (for `ESCALATION`
 * plans), or rotations (for `ONCALL_SCHEDULE` contacts) that Incident
 * Manager engages during an incident.
 *
 * Manage a contact's plan either inline via the `plan` prop on
 * `SSMContacts.Contact` or standalone with this resource — not both.
 * Deleting this resource resets the contact's plan to empty.
 *
 * ### Managing Engagement Plans
 * **Example:** Engage an email channel for 5 minutes
 * ```typescript
 * const plan = yield* SSMContacts.Plan("OncallPlan", {
 *   contactId: oncall.contactArn,
 *   stages: [
 *     {
 *       DurationInMinutes: 5,
 *       Targets: [
 *         {
 *           ChannelTargetInfo: {
 *             ContactChannelId: email.contactChannelArn,
 *             RetryIntervalInMinutes: 1,
 *           },
 *         },
 *       ],
 *     },
 *   ],
 * });
 * ```
 */
declare const PlanResource: import("../../Resource.ts").ResourceClass<Plan>;
export { PlanResource as Plan };
export declare const PlanProvider: () => import("effect/Layer").Layer<Provider.Provider<Plan>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Plan.d.ts.map