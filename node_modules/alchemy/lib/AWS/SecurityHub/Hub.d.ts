import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Which finding format Security Hub generates for controls.
 */
export type ControlFindingGenerator = "STANDARD_CONTROL" | "SECURITY_CONTROL";
export interface HubProps {
    /**
     * Whether to enable the default security standards (AWS Foundational Security
     * Best Practices, CIS) when Security Hub is first enabled. Only takes effect
     * on the initial enablement.
     * @default true
     */
    enableDefaultStandards?: boolean;
    /**
     * Whether Security Hub automatically enables new controls when they are added
     * to enabled standards.
     */
    autoEnableControls?: boolean;
    /**
     * Whether to generate `STANDARD_CONTROL` or `SECURITY_CONTROL` findings.
     */
    controlFindingGenerator?: ControlFindingGenerator;
    /**
     * Tags applied to the Hub. Alchemy ownership tags are merged in automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface Hub extends Resource<"AWS.SecurityHub.Hub", HubProps, {
    /** ARN of the Security Hub Hub resource. */
    hubArn: string;
    /** When Security Hub was enabled for the account. */
    subscribedAt: string | undefined;
    /** Whether new controls are auto-enabled. */
    autoEnableControls: boolean | undefined;
    /** The active control finding generator. */
    controlFindingGenerator: string | undefined;
}, never, Providers> {
}
/**
 * The Security Hub Hub — the account/region singleton that enables AWS Security
 * Hub. Only one Hub can exist per region, so this is a capture-and-restore
 * singleton: adopting a pre-existing Hub that Alchemy did not create requires
 * `--adopt`.
 *
 * ### Enabling Security Hub
 * **Example:** Enable with default standards
 * ```typescript
 * const hub = yield* SecurityHub.Hub("Hub", {});
 * ```
 *
 * **Example:** Enable without default standards, auto-enable controls
 * ```typescript
 * const hub = yield* SecurityHub.Hub("Hub", {
 *   enableDefaultStandards: false,
 *   autoEnableControls: true,
 *   controlFindingGenerator: "SECURITY_CONTROL",
 *   tags: { team: "security" },
 * });
 * ```
 */
declare const HubResource: import("../../Resource.ts").ResourceClass<Hub>;
export { HubResource as Hub };
export declare const HubProvider: () => import("effect/Layer").Layer<Provider.Provider<Hub>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Hub.d.ts.map