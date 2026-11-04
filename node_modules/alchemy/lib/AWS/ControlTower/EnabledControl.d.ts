import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface EnabledControlProps {
    /**
     * The identifier (ARN) of the control to enable, e.g.
     * `arn:aws:controltower:us-west-2::control/AWS-GR_ENCRYPTED_VOLUMES` or a
     * Control Catalog ARN. Changing the control replaces the enablement.
     */
    controlIdentifier: string;
    /**
     * The ARN of the organizational unit the control is enabled on.
     * Changing the target replaces the enablement.
     */
    targetIdentifier: string;
    /**
     * Parameters for configurable controls, as `{ key, value }` pairs.
     * Updated in place via `UpdateEnabledControl`.
     */
    parameters?: {
        key: string;
        value: any;
    }[];
    /**
     * Tags to apply to the enabled control. Merged with internal Alchemy
     * tags.
     */
    tags?: Record<string, string>;
}
export interface EnabledControl extends Resource<"AWS.ControlTower.EnabledControl", EnabledControlProps, {
    /**
     * The ARN of the enabled control.
     */
    enabledControlArn: string;
    /**
     * The identifier of the enabled control.
     */
    controlIdentifier: string;
    /**
     * The ARN of the organizational unit the control is enabled on.
     */
    targetIdentifier: string;
}, never, Providers> {
}
/**
 * An AWS Control Tower control (guardrail) enabled on an organizational
 * unit. Enabling a control starts an asynchronous operation that deploys
 * governance resources (SCPs, Config rules, or hooks) to the OU and the
 * accounts it contains.
 *
 * Requires an AWS Control Tower landing zone and can only be managed from
 * the Organizations management account.
 * ### Enabling Controls
 * **Example:** Enable a preventive guardrail on an OU
 * ```typescript
 * import * as ControlTower from "alchemy/AWS/ControlTower";
 *
 * const encryptedVolumes = yield* ControlTower.EnabledControl("EncryptedVolumes", {
 *   controlIdentifier:
 *     "arn:aws:controltower:us-west-2::control/AWS-GR_ENCRYPTED_VOLUMES",
 *   targetIdentifier: "arn:aws:organizations::111122223333:ou/o-example/ou-example",
 * });
 * ```
 *
 * **Example:** Enable a configurable control with parameters
 * ```typescript
 * const regionDeny = yield* ControlTower.EnabledControl("RegionDeny", {
 *   controlIdentifier:
 *     "arn:aws:controlcatalog:::control/50utmyu7yqmhr8fpnpo8bnaj1",
 *   targetIdentifier: ouArn,
 *   parameters: [
 *     { key: "AllowedRegions", value: ["us-east-1", "us-west-2"] },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const EnabledControl: import("../../Resource.ts").ResourceClass<EnabledControl>;
declare const ControlOperationFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ControlOperationFailed";
} & Readonly<A>;
/**
 * An asynchronous control operation (ENABLE_CONTROL / DISABLE_CONTROL /
 * UPDATE_ENABLED_CONTROL) converged to the terminal `FAILED` status.
 */
export declare class ControlOperationFailed extends ControlOperationFailed_base<{
    readonly operationIdentifier: string;
    readonly status: string;
    readonly statusMessage: string | undefined;
}> {
}
declare const EnabledControlArnUnavailable_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "EnabledControlArnUnavailable";
} & Readonly<A>;
/**
 * `EnableControl` succeeded but the enabled control's ARN could not be
 * resolved from either the operation output or `ListEnabledControls`.
 */
export declare class EnabledControlArnUnavailable extends EnabledControlArnUnavailable_base<{
    readonly controlIdentifier: string;
    readonly targetIdentifier: string;
}> {
}
export declare const EnabledControlProvider: () => import("effect/Layer").Layer<Provider.Provider<EnabledControl>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=EnabledControl.d.ts.map