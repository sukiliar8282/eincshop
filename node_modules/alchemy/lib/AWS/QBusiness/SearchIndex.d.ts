import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type IndexStatus = qbusiness.IndexStatus;
export type IndexType = qbusiness.IndexType;
export interface IndexProps {
    /**
     * The identifier of the Amazon Q Business application the index attaches
     * to. Changing it replaces the index.
     */
    applicationId: string;
    /**
     * Display name of the index.
     * @default ${app}-${stage}-${id}
     */
    displayName?: string;
    /**
     * A description of the index.
     */
    description?: string;
    /**
     * The index tier — `STARTER` (single AZ) or `ENTERPRISE` (multi AZ).
     * Changing it replaces the index.
     * @default "STARTER"
     */
    type?: IndexType;
    /**
     * Provisioned storage capacity units. Each unit stores 20,000 documents.
     * @default 1 unit
     */
    capacityConfiguration?: qbusiness.IndexCapacityConfiguration;
    /**
     * Configuration for document metadata attributes (search/display
     * behavior).
     */
    documentAttributeConfigurations?: qbusiness.DocumentAttributeConfiguration[];
    /**
     * Tags to associate with the index.
     */
    tags?: Record<string, string>;
}
export interface Index extends Resource<"AWS.QBusiness.Index", IndexProps, {
    /**
     * Service-assigned unique identifier of the index (unique within its
     * application).
     */
    indexId: string;
    /**
     * The identifier of the application the index belongs to.
     */
    applicationId: string;
    /**
     * ARN of the index.
     */
    indexArn: string;
    /**
     * The index's display name.
     */
    displayName: string;
    /**
     * The provisioned index tier.
     */
    type: IndexType | undefined;
    /**
     * Current lifecycle status of the index.
     */
    status: IndexStatus | undefined;
    /**
     * Current tags reported for the index.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Q Business index — the document store that data sources sync
 * content into and retrievers query.
 *
 * :::caution
 * An index bills hourly per provisioned capacity unit from the moment it
 * becomes `ACTIVE`. Destroy test indexes promptly.
 * :::
 * ### Creating Indexes
 * **Example:** Starter Index
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const index = yield* AWS.QBusiness.Index("Docs", {
 *   applicationId: app.applicationId,
 * });
 * ```
 *
 * **Example:** Enterprise Index with Extra Capacity
 * ```typescript
 * const index = yield* AWS.QBusiness.Index("Docs", {
 *   applicationId: app.applicationId,
 *   type: "ENTERPRISE",
 *   capacityConfiguration: { units: 2 },
 * });
 * ```
 *
 * @resource
 */
export declare const Index: import("../../Resource.ts").ResourceClass<Index>;
declare const IndexProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "QBusinessIndexProvisioningFailed";
} & Readonly<A>;
/**
 * An index whose asynchronous provisioning converged to the terminal
 * `FAILED` status.
 */
export declare class IndexProvisioningFailed extends IndexProvisioningFailed_base<{
    readonly indexId: string;
    readonly message: string | undefined;
}> {
}
export declare const IndexProvider: () => import("effect/Layer").Layer<Provider.Provider<Index>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=SearchIndex.d.ts.map