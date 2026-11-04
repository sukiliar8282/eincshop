import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RelayProps {
    /**
     * Name of the relay. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Renames apply in place.
     */
    relayName?: string;
    /**
     * Hostname of the downstream SMTP server emails are relayed to. Updates
     * apply in place.
     */
    serverName: string;
    /**
     * Port of the downstream SMTP server (e.g. 25, 587). Updates apply in
     * place.
     */
    serverPort: number;
    /**
     * How Mail Manager authenticates to the downstream server: a Secrets
     * Manager secret ARN holding SMTP credentials, or explicit
     * `{ NoAuthentication: {} }`. Updates apply in place.
     */
    authentication: mm.RelayAuthentication;
    /**
     * Tags applied to the relay. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
export interface Relay extends Resource<"AWS.MailManager.Relay", RelayProps, {
    /** Server-assigned ID of the relay. */
    relayId: string;
    /** ARN of the relay. */
    relayArn: string;
    /** Name of the relay. */
    relayName: string;
}, never, Providers> {
}
/**
 * An SES Mail Manager relay — a downstream SMTP destination that rule-set
 * `Relay` actions forward incoming email to (e.g. an on-prem Exchange
 * server or a third-party filter).
 *
 * All aspects (name, server, port, authentication, tags) update in place.
 * ### Creating Relays
 * **Example:** Unauthenticated Relay
 * ```typescript
 * import * as MailManager from "alchemy/AWS/MailManager";
 *
 * const relay = yield* MailManager.Relay("Downstream", {
 *   serverName: "smtp.example.com",
 *   serverPort: 25,
 *   authentication: { NoAuthentication: {} },
 * });
 * ```
 *
 * **Example:** Authenticated Relay
 * ```typescript
 * const relay = yield* MailManager.Relay("Downstream", {
 *   serverName: "smtp.example.com",
 *   serverPort: 587,
 *   authentication: { SecretArn: secret.secretArn },
 * });
 * ```
 *
 * ### Using in a Rule Set
 * **Example:** Relay Action
 * ```typescript
 * const ruleSet = yield* MailManager.RuleSet("Inbound", {
 *   rules: [
 *     {
 *       Name: "RelayAll",
 *       Actions: [{ Relay: { Relay: relay.relayId } }],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const Relay: import("../../Resource.ts").ResourceClass<Relay>;
export declare const RelayProvider: () => import("effect/Layer").Layer<Provider.Provider<Relay>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Relay.d.ts.map