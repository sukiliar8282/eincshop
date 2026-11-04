import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface IngressPointProps {
    /**
     * Name of the ingress point. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Renames apply in place.
     */
    ingressPointName?: string;
    /**
     * Type of the ingress endpoint: `OPEN` accepts unauthenticated SMTP;
     * `AUTH` requires SMTP AUTH credentials (see
     * {@link IngressPointProps.ingressPointConfiguration}); `MTLS` requires
     * client certificates. Immutable — changing the type replaces the ingress
     * point.
     */
    type: mm.IngressPointType;
    /**
     * ID of the rule set applied to email arriving through this ingress
     * point. Updates apply in place.
     */
    ruleSetId: string;
    /**
     * ID of the traffic policy evaluated against connections to this ingress
     * point. Updates apply in place.
     */
    trafficPolicyId: string;
    /**
     * Authentication configuration for `AUTH`/`MTLS` ingress points: an SMTP
     * password, a Secrets Manager secret ARN, or a TLS trust store. Updates
     * apply in place.
     */
    ingressPointConfiguration?: mm.IngressPointConfiguration;
    /**
     * Network configuration: public (with IP type) or VPC-endpoint private.
     * Immutable — changing it replaces the ingress point.
     * @default public IPV4
     */
    networkConfiguration?: mm.NetworkConfiguration;
    /**
     * TLS policy for inbound connections: `REQUIRED`, `OPTIONAL`, or `FIPS`.
     * Omitting it applies AWS's `FIPS` default. Changes between `REQUIRED` and
     * `OPTIONAL` update in place; AWS rejects updates from or to `FIPS`
     * (including the omitted default), so those transitions replace the
     * ingress point.
     */
    tlsPolicy?: mm.TlsPolicy;
    /**
     * Tags applied to the ingress point. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
export interface IngressPoint extends Resource<"AWS.MailManager.IngressPoint", IngressPointProps, {
    /** Server-assigned ID of the ingress point. */
    ingressPointId: string;
    /** ARN of the ingress point. */
    ingressPointArn: string;
    /** Name of the ingress point. */
    ingressPointName: string;
    /** DNS A record (SMTP endpoint host) of the ingress point. */
    aRecord: string | undefined;
    /** Current status (PROVISIONING, ACTIVE, CLOSED, FAILED, ...). */
    status: string | undefined;
}, never, Providers> {
}
/**
 * An SES Mail Manager ingress point — the SMTP endpoint that receives
 * incoming email, screens it with a traffic policy, and processes it with a
 * rule set.
 *
 * `type` and `networkConfiguration` are immutable (changes replace the
 * endpoint); everything else updates in place.
 * ### Creating Ingress Points
 * **Example:** Open Ingress Point
 * ```typescript
 * import * as MailManager from "alchemy/AWS/MailManager";
 *
 * const ruleSet = yield* MailManager.RuleSet("Inbound", {
 *   rules: [{ Name: "DropAll", Actions: [{ Drop: {} }] }],
 * });
 * const trafficPolicy = yield* MailManager.TrafficPolicy("Edge", {
 *   defaultAction: "ALLOW",
 * });
 * const ingress = yield* MailManager.IngressPoint("Smtp", {
 *   type: "OPEN",
 *   ruleSetId: ruleSet.ruleSetId,
 *   trafficPolicyId: trafficPolicy.trafficPolicyId,
 * });
 * // point your domain's MX record at ingress.aRecord
 * ```
 *
 * **Example:** Authenticated Ingress Point
 * ```typescript
 * const ingress = yield* MailManager.IngressPoint("Smtp", {
 *   type: "AUTH",
 *   ruleSetId: ruleSet.ruleSetId,
 *   trafficPolicyId: trafficPolicy.trafficPolicyId,
 *   ingressPointConfiguration: { SecretArn: secret.secretArn },
 *   tlsPolicy: "REQUIRED",
 * });
 * ```
 *
 * @resource
 */
export declare const IngressPoint: import("../../Resource.ts").ResourceClass<IngressPoint>;
export declare const IngressPointProvider: () => import("effect/Layer").Layer<Provider.Provider<IngressPoint>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=IngressPoint.d.ts.map