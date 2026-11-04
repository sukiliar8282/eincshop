import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Devices.DexTest";
type TypeId = typeof TypeId;
/**
 * What the WARP client probes when the test runs.
 */
export interface DeviceDexTestData {
    /**
     * The URL (for `http` tests) or hostname/IP (for `traceroute` tests)
     * to probe.
     */
    host: string;
    /** The kind of synthetic test the WARP client runs. */
    kind: "http" | "traceroute";
    /** The HTTP method to use — only `GET` is supported. */
    method?: "GET" | (string & {});
}
/**
 * A device-profile (DEX rule) targeted by the test.
 */
export interface DeviceDexTestTargetPolicy {
    /** The id of the device settings profile. */
    id: string;
    /** Whether the profile is the account default. */
    default?: boolean;
    /** The name of the device settings profile. */
    name?: string;
}
export interface DeviceDexTestProps {
    /**
     * Name of the DEX test. Must be unique within the account. If omitted,
     * a unique name is generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The synthetic probe the WARP client runs.
     */
    data: DeviceDexTestData;
    /**
     * How often the test runs, as a duration string (e.g. `0h30m0s`).
     */
    interval: string;
    /**
     * Whether the test is active.
     * @default true
     */
    enabled?: boolean;
    /**
     * Additional details about the test.
     */
    description?: string;
    /**
     * Device settings profiles (DEX rules) targeted by this test.
     */
    targetPolicies?: DeviceDexTestTargetPolicy[];
    /**
     * Whether the test only runs for devices matching `targetPolicies`.
     */
    targeted?: boolean;
}
export type DeviceDexTestAttributes = {
    /** API UUID of the DEX test. */
    testId: string;
    /** Account that owns the test. */
    accountId: string;
    /** Observed test name. */
    name: string;
    /** Observed probe configuration. */
    data: DeviceDexTestData;
    /** Observed run interval. */
    interval: string;
    /** Whether the test is active. */
    enabled: boolean;
    /** Observed description, if any. */
    description: string | undefined;
};
export type DeviceDexTest = Resource<TypeId, DeviceDexTestProps, DeviceDexTestAttributes, never, Providers>;
/**
 * A Cloudflare Zero Trust **DEX synthetic test** — an HTTP or traceroute
 * probe that enrolled WARP devices run on a schedule so the Digital
 * Experience Monitoring dashboard can chart reachability and latency to
 * your critical applications.
 *
 * Requires the DEX entitlement on the account (the API rejects writes
 * with `Forbidden` / `dex.api.entitlements.missing` otherwise).
 * ### Creating a DEX test
 * **Example:** HTTP probe every 30 minutes
 * ```typescript
 * const test = yield* Cloudflare.Devices.DeviceDexTest("AppHealth", {
 *   data: { host: "https://app.example.com/health", kind: "http", method: "GET" },
 *   interval: "0h30m0s",
 *   description: "Internal app reachability",
 * });
 * ```
 *
 * **Example:** Traceroute probe targeting specific device profiles
 * ```typescript
 * const trace = yield* Cloudflare.Devices.DeviceDexTest("OriginTrace", {
 *   data: { host: "203.0.113.10", kind: "traceroute" },
 *   interval: "0h30m0s",
 *   targeted: true,
 *   targetPolicies: [{ id: profile.policyId }],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/insights/dex/tests/
 *
 * @resource
 * @product Devices
 * @category Cloudflare One (Zero Trust)
 */
export declare const DeviceDexTest: import("../../Resource.ts").ResourceClass<DeviceDexTest>;
/**
 * Returns true if the given value is a DeviceDexTest resource.
 */
export declare const isDeviceDexTest: (value: unknown) => value is DeviceDexTest;
export declare const DeviceDexTestProvider: () => import("effect/Layer").Layer<Provider.Provider<DeviceDexTest>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=DexTest.d.ts.map