import * as sitewise from "@distilled.cloud/aws/iotsitewise";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type AssetState = sitewise.AssetState;
export interface AssetProps {
    /**
     * A unique name for the asset.
     * @default ${app}-${stage}-${id}
     */
    assetName?: string;
    /**
     * The ID of the asset model from which to create the asset.
     * Changing the model replaces the asset.
     */
    assetModelId: string;
    /**
     * A description for the asset.
     */
    assetDescription?: string;
    /**
     * Tags to associate with the asset.
     */
    tags?: Record<string, string>;
}
export interface Asset extends Resource<"AWS.IoTSiteWise.Asset", AssetProps, {
    /**
     * Service-assigned UUID of the asset.
     */
    assetId: string;
    /**
     * ARN of the asset.
     */
    assetArn: string;
    /**
     * The asset's name.
     */
    assetName: string;
    /**
     * The ID of the asset model the asset was created from.
     */
    assetModelId: string;
    /**
     * Current lifecycle state of the asset.
     */
    state: AssetState;
    /**
     * Current tags reported for the asset.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS IoT SiteWise asset — an instance of an asset model representing
 * a physical piece of industrial equipment or a logical grouping.
 *
 * Asset creation and updates are asynchronous (`CREATING`/`UPDATING` →
 * `ACTIVE`); the provider waits for the asset to converge to `ACTIVE`
 * before returning.
 *
 * ### Creating Assets
 * **Example:** Asset from an Asset Model
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const model = yield* AWS.IoTSiteWise.AssetModel("PumpModel", {
 *   assetModelProperties: [
 *     { name: "Temperature", dataType: "DOUBLE", type: { measurement: {} } },
 *   ],
 * });
 *
 * const asset = yield* AWS.IoTSiteWise.Asset("Pump1", {
 *   assetModelId: model.assetModelId,
 *   assetDescription: "Pump #1 on the west line",
 * });
 * ```
 *
 * @resource
 */
export declare const Asset: import("../../Resource.ts").ResourceClass<Asset>;
declare const AssetProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AssetProvisioningFailed";
} & Readonly<A>;
/**
 * An asset whose asynchronous provisioning converged to the terminal
 * `FAILED` state.
 */
export declare class AssetProvisioningFailed extends AssetProvisioningFailed_base<{
    readonly assetId: string;
    readonly message: string | undefined;
}> {
}
export declare const AssetProvider: () => import("effect/Layer").Layer<Provider.Provider<Asset>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Asset.d.ts.map