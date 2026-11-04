import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface EnabledBaselineProps {
    /**
     * The ARN of the baseline to enable, e.g. the `AWSControlTowerBaseline`
     * ARN from `ListBaselines`. Changing the baseline replaces the
     * enablement.
     */
    baselineIdentifier: string;
    /**
     * The baseline version to enable, e.g. `"4.0"`. Updated in place via
     * `UpdateEnabledBaseline`.
     */
    baselineVersion: string;
    /**
     * The ARN of the target (organizational unit) the baseline is enabled
     * on. Changing the target replaces the enablement.
     */
    targetIdentifier: string;
    /**
     * Parameters applied to the baseline, as `{ key, value }` pairs — e.g.
     * `IdentityCenterEnabledBaselineArn` for the `AWSControlTowerBaseline`.
     * Updated in place via `UpdateEnabledBaseline`.
     */
    parameters?: {
        key: string;
        value: any;
    }[];
    /**
     * Tags to apply to the enabled baseline. Merged with internal Alchemy
     * tags.
     */
    tags?: Record<string, string>;
}
export interface EnabledBaseline extends Resource<"AWS.ControlTower.EnabledBaseline", EnabledBaselineProps, {
    /**
     * The ARN of the enabled baseline (the `EnabledBaseline` resource).
     */
    enabledBaselineArn: string;
    /**
     * The ARN of the baseline that was enabled.
     */
    baselineIdentifier: string;
    /**
     * The ARN of the target organizational unit.
     */
    targetIdentifier: string;
    /**
     * The enabled baseline version.
     */
    baselineVersion: string | undefined;
}, never, Providers> {
}
/**
 * An AWS Control Tower baseline enabled on a target organizational unit.
 * Enabling a baseline (e.g. `AWSControlTowerBaseline`) starts an
 * asynchronous operation that registers the OU with Control Tower and
 * deploys the baseline's governance resources to its accounts.
 *
 * Requires an AWS Control Tower landing zone and can only be managed from
 * the Organizations management account.
 * ### Enabling Baselines
 * **Example:** Register an OU with Control Tower
 * ```typescript
 * import * as ControlTower from "alchemy/AWS/ControlTower";
 *
 * const enabled = yield* ControlTower.EnabledBaseline("WorkloadsBaseline", {
 *   baselineIdentifier:
 *     "arn:aws:controltower:us-west-2::baseline/17BSJV3IGJ2QSGA2",
 *   baselineVersion: "4.0",
 *   targetIdentifier: "arn:aws:organizations::111122223333:ou/o-example/ou-example",
 * });
 * ```
 *
 * **Example:** Baseline with Identity Center parameter
 * ```typescript
 * const enabled = yield* ControlTower.EnabledBaseline("WorkloadsBaseline", {
 *   baselineIdentifier: controlTowerBaselineArn,
 *   baselineVersion: "4.0",
 *   targetIdentifier: ouArn,
 *   parameters: [
 *     {
 *       key: "IdentityCenterEnabledBaselineArn",
 *       value: identityCenterEnabledBaselineArn,
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const EnabledBaseline: import("../../Resource.ts").ResourceClass<EnabledBaseline>;
declare const BaselineOperationFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "BaselineOperationFailed";
} & Readonly<A>;
/**
 * An asynchronous baseline operation (ENABLE_BASELINE / DISABLE_BASELINE /
 * UPDATE_ENABLED_BASELINE) converged to the terminal `FAILED` status.
 */
export declare class BaselineOperationFailed extends BaselineOperationFailed_base<{
    readonly operationIdentifier: string;
    readonly status: string;
    readonly statusMessage: string | undefined;
}> {
}
export declare const EnabledBaselineProvider: () => import("effect/Layer").Layer<Provider.Provider<EnabledBaseline>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=EnabledBaseline.d.ts.map