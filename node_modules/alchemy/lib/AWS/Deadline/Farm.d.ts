import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface FarmProps {
    /**
     * Display name of the farm.
     * @default ${app}-${stage}-${id}
     */
    displayName?: string;
    /**
     * A description of the farm.
     */
    description?: string;
    /**
     * ARN of the KMS key used to encrypt farm data. Changing it replaces the
     * farm.
     * @default an AWS-owned key
     */
    kmsKeyArn?: string;
    /**
     * Multiplier applied to the cost of renders on this farm when computing
     * budget usage.
     * @default 1
     */
    costScaleFactor?: number;
    /**
     * Tags to associate with the farm.
     */
    tags?: Record<string, string>;
}
export interface Farm extends Resource<"AWS.Deadline.Farm", FarmProps, {
    /**
     * Service-assigned unique identifier of the farm (`farm-...`).
     */
    farmId: string;
    /**
     * ARN of the farm.
     */
    farmArn: string;
    /**
     * The farm's display name.
     */
    displayName: string;
    /**
     * ARN of the KMS key encrypting farm data, when customer-managed.
     */
    kmsKeyArn: string | undefined;
    /**
     * The configured cost scale factor.
     */
    costScaleFactor: number;
    /**
     * Current tags reported for the farm.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Deadline Cloud farm — the top-level container for render-farm
 * queues, fleets, storage profiles, and budgets.
 *
 * ### Creating Farms
 * **Example:** Basic Farm
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const farm = yield* AWS.Deadline.Farm("RenderFarm", {});
 * ```
 *
 * **Example:** Farm with Description and Cost Scaling
 * ```typescript
 * const farm = yield* AWS.Deadline.Farm("RenderFarm", {
 *   displayName: "studio-renders",
 *   description: "Production render farm",
 *   costScaleFactor: 1.5,
 *   tags: { team: "vfx" },
 * });
 * ```
 *
 * @resource
 */
export declare const Farm: import("../../Resource.ts").ResourceClass<Farm>;
export declare const FarmProvider: () => import("effect/Layer").Layer<Provider.Provider<Farm>, never, import("../Environment.ts").AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Farm.d.ts.map