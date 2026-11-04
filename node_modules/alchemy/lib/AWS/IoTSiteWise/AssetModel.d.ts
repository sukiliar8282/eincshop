import * as sitewise from "@distilled.cloud/aws/iotsitewise";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type AssetModelType = sitewise.AssetModelType;
export type AssetModelState = sitewise.AssetModelState;
export type AssetModelPropertyDefinition = sitewise.AssetModelPropertyDefinition;
export type AssetModelHierarchyDefinition = sitewise.AssetModelHierarchyDefinition;
export type AssetModelCompositeModelDefinition = sitewise.AssetModelCompositeModelDefinition;
export interface AssetModelProps {
    /**
     * A unique name for the asset model.
     * @default ${app}-${stage}-${id}
     */
    assetModelName?: string;
    /**
     * The type of asset model: `ASSET_MODEL` (default, creates assets),
     * `COMPONENT_MODEL` (reusable component), or `INTERFACE`.
     * Changing the type replaces the asset model.
     * @default "ASSET_MODEL"
     */
    assetModelType?: AssetModelType;
    /**
     * A description for the asset model.
     */
    assetModelDescription?: string;
    /**
     * The property definitions of the asset model (attributes, measurements,
     * transforms, and metrics). Assets created from the model inherit these.
     */
    assetModelProperties?: AssetModelPropertyDefinition[];
    /**
     * The hierarchy definitions of the asset model. Each hierarchy specifies
     * an asset model whose assets can be children of assets created from
     * this model.
     */
    assetModelHierarchies?: AssetModelHierarchyDefinition[];
    /**
     * The composite models that are part of this asset model (e.g. alarms
     * or component-model references).
     */
    assetModelCompositeModels?: AssetModelCompositeModelDefinition[];
    /**
     * Tags to associate with the asset model.
     */
    tags?: Record<string, string>;
}
export interface AssetModel extends Resource<"AWS.IoTSiteWise.AssetModel", AssetModelProps, {
    /**
     * Service-assigned UUID of the asset model.
     */
    assetModelId: string;
    /**
     * ARN of the asset model.
     */
    assetModelArn: string;
    /**
     * The asset model's name.
     */
    assetModelName: string;
    /**
     * The asset model's type.
     */
    assetModelType: AssetModelType | undefined;
    /**
     * Current lifecycle state of the asset model.
     */
    state: AssetModelState;
    /**
     * Current tags reported for the asset model.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS IoT SiteWise asset model — a standardized definition of
 * properties (attributes, measurements, transforms, metrics) and
 * hierarchies from which industrial assets are created.
 *
 * Asset model creation and updates are asynchronous
 * (`CREATING`/`UPDATING` → `ACTIVE`); the provider waits for the model to
 * converge to `ACTIVE` before returning.
 *
 * ### Creating Asset Models
 * **Example:** Asset Model with a Measurement and an Attribute
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const model = yield* AWS.IoTSiteWise.AssetModel("PumpModel", {
 *   assetModelDescription: "A pump on the factory floor",
 *   assetModelProperties: [
 *     {
 *       name: "SerialNumber",
 *       dataType: "STRING",
 *       type: { attribute: { defaultValue: "unknown" } },
 *     },
 *     {
 *       name: "Temperature",
 *       dataType: "DOUBLE",
 *       unit: "Celsius",
 *       type: { measurement: {} },
 *     },
 *   ],
 * });
 * ```
 *
 * ### Hierarchies
 * **Example:** Parent Model with a Child Hierarchy
 * ```typescript
 * const pump = yield* AWS.IoTSiteWise.AssetModel("PumpModel", {
 *   assetModelProperties: [
 *     { name: "Temperature", dataType: "DOUBLE", type: { measurement: {} } },
 *   ],
 * });
 *
 * const site = yield* AWS.IoTSiteWise.AssetModel("SiteModel", {
 *   assetModelHierarchies: [
 *     { name: "Pumps", childAssetModelId: pump.assetModelId },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const AssetModel: import("../../Resource.ts").ResourceClass<AssetModel>;
declare const AssetModelProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AssetModelProvisioningFailed";
} & Readonly<A>;
/**
 * An asset model whose asynchronous provisioning converged to the
 * terminal `FAILED` state.
 */
export declare class AssetModelProvisioningFailed extends AssetModelProvisioningFailed_base<{
    readonly assetModelId: string;
    readonly message: string | undefined;
}> {
}
export declare const AssetModelProvider: () => import("effect/Layer").Layer<Provider.Provider<AssetModel>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=AssetModel.d.ts.map