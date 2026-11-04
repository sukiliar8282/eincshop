import { Services } from "@distilled.cloud/hetzner";
import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
/**
 * Resource-valued prop. The engine resolves `Effect`s (including other
 * Resources) before lifecycle operations see the value.
 */
type Ref<T> = T | Effect.Effect<T, never, Providers>;
/**
 * Server identity used by `applyTo`. A `Hetzner.Server` resource
 * satisfies this via `serverId`.
 */
type Server = {
    readonly serverId: number;
};
export type FirewallDirection = "in" | "out";
export type FirewallProtocol = "tcp" | "udp" | "icmp" | "esp" | "gre";
export interface FirewallRule {
    /**
     * Description of the rule.
     */
    description?: string;
    /**
     * Traffic direction. Incoming rules use `sourceIps`; outgoing rules
     * use `destinationIps`.
     */
    direction: FirewallDirection;
    /**
     * Network protocol this rule applies to.
     */
    protocol: FirewallProtocol;
    /**
     * Port or port range (`22` or `1024-5000`). Only valid for `tcp` and
     * `udp`.
     */
    port?: string;
    /**
     * Permitted source CIDRs for incoming traffic. Use `0.0.0.0/0` and
     * `::/0` to allow any address.
     */
    sourceIps?: string[];
    /**
     * Permitted destination CIDRs for outgoing traffic. Use `0.0.0.0/0`
     * and `::/0` to allow any address.
     */
    destinationIps?: string[];
}
export interface FirewallProps {
    /**
     * Name of the firewall. Must be unique per Hetzner project. If
     * omitted, a unique name is generated from `${stack}-${id}-${stage}`.
     */
    name?: string;
    /**
     * Firewall rules. Limited to 50 entries per firewall. An empty list
     * (the default) drops all inbound traffic and accepts all outbound
     * traffic.
     */
    rules?: FirewallRule[];
    /**
     * Servers this firewall is applied to. This wave's tests leave
     * `applyTo` empty; the type still accepts `Server` resources.
     */
    applyTo?: Array<Ref<Server>>;
    /**
     * User-defined labels. Alchemy ownership labels (`alchemy.stack`,
     * `alchemy.stage`, `alchemy.id`) are always merged in.
     */
    labels?: Record<string, string>;
}
export type FirewallAppliedTo = {
    type: "server";
    serverId: number;
};
export interface Firewall extends Resource<"Hetzner.Firewall", FirewallProps, {
    /**
     * Numeric Hetzner firewall id.
     */
    id: number;
    /**
     * Name of the firewall.
     */
    name: string;
    /**
     * RFC3339 timestamp when the firewall was created.
     */
    created: string;
    /**
     * Current rules, in the same camelCase shape as {@link FirewallRule}.
     */
    rules: FirewallRule[];
    /**
     * Server ids the firewall is currently applied to (direct
     * `type=server` attachments only).
     */
    appliedTo: FirewallAppliedTo[];
    /**
     * User-facing labels (Alchemy ownership labels stripped).
     */
    labels: Record<string, string>;
}, never, Providers> {
}
/**
 * A Hetzner Cloud firewall — a named set of inbound/outbound rules that
 * can be applied to one or more Servers.
 *
 * Name, rules, labels, and `applyTo` are all mutable. Changing the name
 * updates the existing firewall in place (it is unique per project).
 * @see https://docs.hetzner.cloud/reference/cloud#firewalls
 *
 * ### Creating a Firewall
 * **Example:** Basic firewall
 * ```typescript
 * const web = yield* Hetzner.Firewall("web", {
 *   rules: [
 *     {
 *       direction: "in",
 *       protocol: "tcp",
 *       port: "22",
 *       sourceIps: ["0.0.0.0/0", "::/0"],
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Firewall applied to a Server
 * ```typescript
 * const server = yield* Hetzner.Server("app", {
 *   image: "ubuntu-24.04",
 *   serverType: "cx22",
 *   location: "nbg1",
 * });
 * const web = yield* Hetzner.Firewall("web", {
 *   applyTo: [server],
 *   rules: [
 *     {
 *       direction: "in",
 *       protocol: "tcp",
 *       port: "443",
 *       sourceIps: ["0.0.0.0/0", "::/0"],
 *     },
 *   ],
 * });
 * ```
 *
 * ### Updating rules
 * **Example:** Replace the rule set
 * ```typescript
 * const web = yield* Hetzner.Firewall("web", {
 *   rules: [
 *     {
 *       direction: "in",
 *       protocol: "tcp",
 *       port: "80",
 *       sourceIps: ["0.0.0.0/0", "::/0"],
 *     },
 *     {
 *       direction: "in",
 *       protocol: "tcp",
 *       port: "443",
 *       sourceIps: ["0.0.0.0/0", "::/0"],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const Firewall: import("../Resource.ts").ResourceClass<Firewall>;
declare const FirewallNotCreated_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.FirewallNotCreated";
} & Readonly<A>;
export declare class FirewallNotCreated extends FirewallNotCreated_base<{
    name: string;
}> {
}
export declare const FirewallProvider: () => import("effect/Layer").Layer<Provider.Provider<Firewall>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=Firewall.d.ts.map