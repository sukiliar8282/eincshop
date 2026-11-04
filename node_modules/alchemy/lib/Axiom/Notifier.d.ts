import * as Axiom from "@distilled.cloud/axiom";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
export type NotifierProps = Axiom.CreateNotifierRequest;
export type Notifier = Resource<"Axiom.Notifier", NotifierProps, Axiom.CreateNotifierResponse & {
    id: string;
}, never, Providers>;
/**
 * An Axiom notifier — an alert destination (Slack, email, PagerDuty,
 * Opsgenie, Discord, Microsoft Teams, generic webhook, or a fully custom
 * webhook with templated body/headers) that {@link Monitor monitors} target
 * via `notifierIds`. Exactly one channel under `properties` should be set.
 * @see https://axiom.co/docs/monitor-data/notifiers
 *
 * ### Creating a Notifier
 * **Example:** Slack incoming webhook
 * ```typescript
 * const slack = yield* Axiom.Notifier("ops-slack", {
 *   name: "ops-channel",
 *   properties: {
 *     slack: { slackUrl: process.env.SLACK_WEBHOOK_URL! },
 *   },
 * });
 * ```
 *
 * **Example:** Email distribution list
 * ```typescript
 * yield* Axiom.Notifier("ops-email", {
 *   name: "ops-team",
 *   properties: { email: { emails: ["sre@example.com", "oncall@example.com"] } },
 * });
 * ```
 *
 * **Example:** PagerDuty integration
 * ```typescript
 * yield* Axiom.Notifier("pagerduty", {
 *   name: "primary-oncall",
 *   properties: {
 *     pagerduty: { routingKey: process.env.PAGERDUTY_ROUTING_KEY!, token: "" },
 *   },
 * });
 * ```
 *
 * **Example:** Custom webhook with templated body
 * ```typescript
 * yield* Axiom.Notifier("incident-webhook", {
 *   name: "incident.io",
 *   properties: {
 *     customWebhook: {
 *       url: "https://api.incident.io/v2/alert_events",
 *       headers: { "Content-Type": "application/json" },
 *       secretHeaders: { Authorization: `Bearer ${process.env.INCIDENT_TOKEN}` },
 *       body: '{"title": "{{.Monitor.Name}}", "status": "firing"}',
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Notifier: import("../Resource.ts").ResourceClass<Notifier>;
export declare const NotifierProvider: () => import("effect/Layer").Layer<Provider.Provider<Notifier>, never, Axiom.AxiomOpContext>;
//# sourceMappingURL=Notifier.d.ts.map