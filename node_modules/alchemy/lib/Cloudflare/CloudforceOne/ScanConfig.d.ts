import * as cloudforceOne from "@distilled.cloud/cloudflare/cloudforce-one";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.CloudforceOne.ScanConfig";
type TypeId = typeof TypeId;
export type ScanConfigProps = {
    /**
     * IP addresses or CIDR blocks to scan. The maximum number of total IP
     * addresses allowed is 5000.
     */
    ips: string[];
    /**
     * Number of days between each scan (`0` = one-off scan).
     * @default 0
     */
    frequency?: number;
    /**
     * Ports to scan. Valid values are `"default"` (the 100 most commonly open
     * ports), `"all"`, or a list of ports / port ranges (e.g. `["1-80", "443"]`).
     * @default ["default"]
     */
    ports?: string[];
};
export type ScanConfigAttributes = {
    /**
     * Server-assigned scan config identifier (UUID).
     */
    configId: string;
    /**
     * The Cloudflare account the scan config belongs to.
     */
    accountId: string;
    /**
     * IP addresses or CIDR blocks being scanned.
     */
    ips: string[];
    /**
     * Number of days between each scan (`0` = one-off scan).
     */
    frequency: number;
    /**
     * Ports being scanned.
     */
    ports: string[];
};
export type ScanConfig = Resource<TypeId, ScanConfigProps, ScanConfigAttributes, never, Providers>;
/**
 * A Cloudforce One attack-surface scan configuration.
 *
 * Cloudforce One (Cloudflare's threat-intelligence product) can periodically
 * port-scan IP addresses you own to map your attack surface. A scan config
 * declares which IPs to scan, on which ports, and how often. Scan results are
 * read back via the scan-results API; the config itself is the only
 * declarative piece.
 *
 * Requires the `cfone.port_scan` entitlement (Cloudforce One subscription) —
 * accounts without it receive an `Unauthorized` error for every scan-config
 * operation.
 * ### Creating a Scan Config
 * **Example:** One-off scan of a single address
 * ```typescript
 * const scan = yield* Cloudflare.CloudforceOne.ScanConfig("edge-scan", {
 *   ips: ["203.0.113.7/32"],
 *   frequency: 0,
 * });
 * ```
 *
 * **Example:** Weekly scan of a CIDR block on specific ports
 * ```typescript
 * const scan = yield* Cloudflare.CloudforceOne.ScanConfig("perimeter", {
 *   ips: ["203.0.113.0/24"],
 *   frequency: 7,
 *   ports: ["1-80", "443"],
 * });
 * ```
 *
 * ### Updating
 * **Example:** Change the schedule and port list in place
 * ```typescript
 * const scan = yield* Cloudflare.CloudforceOne.ScanConfig("perimeter", {
 *   ips: ["203.0.113.0/24"],
 *   frequency: 30,
 *   ports: ["all"],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/security-center/intel-apis/attack-surface-scans/
 *
 * @resource
 * @product Cloudforce One
 * @category Observability & Analytics
 */
export declare const ScanConfig: import("../../Resource.ts").ResourceClass<ScanConfig>;
/**
 * Returns true if the given value is a ScanConfig resource.
 */
export declare const isScanConfig: (value: unknown) => value is ScanConfig;
export declare const ScanConfigProvider: () => import("effect/Layer").Layer<Provider.Provider<ScanConfig>, never, CloudflareEnvironment | cloudforceOne.CloudflareOpContext>;
export {};
//# sourceMappingURL=ScanConfig.d.ts.map