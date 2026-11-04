import * as appflow from "@distilled.cloud/aws/appflow";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface FlowProps {
    /**
     * The name of the flow. Must be unique in the account/region, may contain
     * only letters, digits, hyphens, underscores, `!`, `@`, `#`, `.`, `$`.
     * If omitted, a deterministic physical name is generated. Changing the
     * name replaces the flow.
     */
    flowName?: string;
    /**
     * A description of the flow.
     */
    description?: string;
    /**
     * The ARN of a KMS key AppFlow uses to encrypt data. If omitted, the
     * AWS-managed AppFlow key is used.
     */
    kmsArn?: string;
    /**
     * How the flow is triggered — on demand, on a schedule, or by an event.
     * @default { triggerType: "OnDemand" }
     */
    triggerConfig?: appflow.TriggerConfig;
    /**
     * Configuration of the source connector (e.g. S3, Salesforce) the flow
     * pulls data from.
     */
    sourceFlowConfig: appflow.SourceFlowConfig;
    /**
     * Configuration of the destination connector(s) the flow pushes data to.
     */
    destinationFlowConfigList: appflow.DestinationFlowConfig[];
    /**
     * The field mapping tasks applied to records as they move from source to
     * destination.
     */
    tasks: appflow.Task[];
    /**
     * Glue Data Catalog configuration for cataloging flow output.
     */
    metadataCatalogConfig?: appflow.MetadataCatalogConfig;
    /**
     * User-defined tags for the flow.
     */
    tags?: Record<string, string>;
}
export interface Flow extends Resource<"AWS.AppFlow.Flow", FlowProps, {
    flowName: string;
    flowArn: string;
    flowStatus: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon AppFlow flow. A flow transfers data between a source connector
 * and one or more destination connectors, applying field-mapping tasks.
 * The credential-free S3-to-S3 path is directly testable; other connectors
 * require a {@link ConnectorProfile} with vendor credentials.
 *
 * For an S3 source, the bucket policy must authorize the
 * `appflow.amazonaws.com` service principal (`s3:GetObject` + `s3:ListBucket`
 * on the source; `s3:PutObject` and the multipart/ACL actions on the
 * destination), and the source prefix must contain at least one object when
 * the flow is created — AppFlow validates connectivity by listing the source
 * at `CreateFlow` time and rejects an empty prefix with
 * `ConnectorServerException`.
 * ### Creating a Flow
 * **Example:** S3 to S3 On-Demand Flow
 * ```typescript
 * const flow = yield* AppFlow.Flow("Copy", {
 *   triggerConfig: { triggerType: "OnDemand" },
 *   sourceFlowConfig: {
 *     connectorType: "S3",
 *     sourceConnectorProperties: {
 *       S3: { bucketName: srcBucket, bucketPrefix: "input" },
 *     },
 *   },
 *   destinationFlowConfigList: [
 *     {
 *       connectorType: "S3",
 *       destinationConnectorProperties: {
 *         S3: { bucketName: dstBucket, bucketPrefix: "output" },
 *       },
 *     },
 *   ],
 *   tasks: [
 *     {
 *       taskType: "Map_all",
 *       sourceFields: [],
 *       connectorOperator: { S3: "NO_OP" },
 *       taskProperties: {},
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const Flow: import("../../Resource.ts").ResourceClass<Flow>;
export declare const FlowProvider: () => import("effect/Layer").Layer<Provider.Provider<Flow>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Flow.d.ts.map