import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface HostedZoneProps {
    /**
     * Fully qualified domain name for the zone (e.g. `"example.com"`). A trailing
     * dot is added automatically. Changing the name forces replacement.
     */
    name: string;
    /**
     * Optional comment describing the zone. Updated in place.
     */
    comment?: string;
    /**
     * Whether this is a private hosted zone. Requires `vpc`. Changing this forces
     * replacement.
     * @default false
     */
    privateZone?: boolean;
    /**
     * VPC to associate with a private hosted zone at create time. Changing the
     * initial VPC forces replacement.
     */
    vpc?: {
        /** VPC ID. */
        vpcId: string;
        /** Region the VPC lives in. */
        vpcRegion: string;
    };
    /**
     * ID of a reusable delegation set to associate with the zone. Changing this
     * forces replacement.
     */
    delegationSetId?: string;
    /**
     * Whether to delete all non-SOA/NS records before deleting the zone.
     * @default false
     */
    forceDestroy?: boolean;
    /**
     * Tags applied to the hosted zone.
     */
    tags?: Record<string, string>;
}
export interface HostedZone extends Resource<"AWS.Route53.HostedZone", HostedZoneProps, {
    /**
     * Hosted zone ID (without the `/hostedzone/` prefix).
     */
    id: string;
    /**
     * Fully qualified zone name (with trailing dot).
     */
    name: string;
    /**
     * Authoritative name servers for the zone.
     */
    nameServers: string[];
    /**
     * Current zone comment.
     */
    comment: string | undefined;
}, never, Providers> {
}
/**
 * A Route 53 hosted zone.
 *
 * `HostedZone` manages the lifecycle of a public or private hosted zone,
 * including its comment and tags. For public zones, the four authoritative
 * name servers are exposed as `nameServers`.
 * ### Creating a Hosted Zone
 * **Example:** Public Hosted Zone
 * ```typescript
 * const zone = yield* HostedZone("MyZone", {
 *   name: "example.com",
 *   comment: "Primary zone",
 * });
 * // zone.nameServers -> the 4 NS records to set at your registrar
 * ```
 *
 * **Example:** Force Destroy
 * ```typescript
 * const zone = yield* HostedZone("MyZone", {
 *   name: "example.com",
 *   forceDestroy: true, // delete leftover records on destroy
 * });
 * ```
 *
 * @resource
 */
export declare const HostedZone: import("../../Resource.ts").ResourceClass<HostedZone>;
export declare const HostedZoneProvider: () => import("effect/Layer").Layer<Provider.Provider<HostedZone>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=HostedZone.d.ts.map