import * as incidents from "@distilled.cloud/aws/ssm-incidents";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ResponsePlanProps {
    /**
     * The name of the response plan. Must be unique in the account and can't
     * contain spaces. Changing it replaces the response plan.
     *
     * @default ${app}-${id}-${stage}-${suffix}
     */
    name?: string;
    /**
     * A human-readable name shown in the Incident Manager console.
     */
    displayName?: string;
    /**
     * Details used to create the incident when this response plan starts an
     * incident: title, impact (1 = critical … 5 = no impact), optional summary,
     * dedupe string, SNS notification targets, and tags applied to the incident
     * record.
     */
    incidentTemplate: incidents.IncidentTemplate;
    /**
     * The AWS Chatbot chat channel used for collaboration during an incident.
     */
    chatChannel?: incidents.ChatChannel;
    /**
     * ARNs of the Incident Manager contacts and escalation plans that the
     * response plan engages during an incident.
     */
    engagements?: string[];
    /**
     * The Systems Manager Automation runbooks to run at the beginning of the
     * incident.
     */
    actions?: incidents.Action[];
    /**
     * PagerDuty integrations to associate with the response plan.
     */
    integrations?: incidents.Integration[];
    /**
     * Tags applied to the response plan. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface ResponsePlan extends Resource<"AWS.SSMIncidents.ResponsePlan", ResponsePlanProps, {
    /** ARN of the response plan. */
    arn: string;
    /** Name of the response plan. */
    name: string;
}, never, Providers> {
}
/**
 * An Incident Manager response plan — the template that automates the initial
 * response to incidents by engaging contacts, starting chat-channel
 * collaboration, and running Automation runbooks.
 *
 * Requires the account's Incident Manager replication set
 * (`SSMIncidents.ReplicationSet`) to exist.
 *
 * ### Creating Response Plans
 * **Example:** Minimal response plan
 * ```typescript
 * const replicationSet = yield* SSMIncidents.ReplicationSet("Incidents", {});
 * const plan = yield* SSMIncidents.ResponsePlan("Critical", {
 *   incidentTemplate: { title: "Critical failure", impact: 1 },
 * });
 * ```
 *
 * **Example:** Response plan with engagements and chat channel
 * ```typescript
 * const plan = yield* SSMIncidents.ResponsePlan("Sev1", {
 *   displayName: "Severity 1 response",
 *   incidentTemplate: {
 *     title: "Sev1 incident",
 *     impact: 1,
 *     summary: "Automated Sev1 response",
 *     notificationTargets: [{ snsTopicArn: topic.topicArn }],
 *   },
 *   engagements: [oncall.contactArn],
 *   chatChannel: { chatbotSns: [topic.topicArn] },
 * });
 * ```
 */
declare const ResponsePlanResource: import("../../Resource.ts").ResourceClass<ResponsePlan>;
export { ResponsePlanResource as ResponsePlan };
export declare const ResponsePlanProvider: () => import("effect/Layer").Layer<Provider.Provider<ResponsePlan>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ResponsePlan.d.ts.map