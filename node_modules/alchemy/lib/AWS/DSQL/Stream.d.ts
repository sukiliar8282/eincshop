import * as dsql from "@distilled.cloud/aws/dsql";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface StreamProps {
    /**
     * Identifier of the DSQL cluster whose committed row-level changes the
     * stream captures. The cluster must be in `ACTIVE` status when the stream
     * is created (an `IDLE` cluster rejects `CreateStream` with a validation
     * error). Changing the cluster replaces the stream.
     */
    clusterId: string;
    /**
     * ARN of the Amazon Kinesis data stream that receives the change records.
     * Must be in the same account and region as the cluster. Configure the
     * Kinesis stream with `maxRecordSizeInKiB: 10240` — CDC records can
     * approach 10 MiB and an undersized stream becomes `IMPAIRED` with
     * `KINESIS_OVERSIZE_RECORD`. Changing the target replaces the stream.
     */
    kinesisStreamArn: string;
    /**
     * ARN of the IAM role Aurora DSQL assumes to write records into the
     * Kinesis stream. The role's trust policy must allow the
     * `dsql.amazonaws.com` service principal and its permissions policy must
     * grant `kinesis:PutRecord`, `kinesis:PutRecords`,
     * `kinesis:DescribeStreamSummary` and `kinesis:ListShards` on the target
     * stream. Changing the role replaces the stream.
     */
    roleArn: string;
    /**
     * Record ordering guarantee. Only `UNORDERED` is currently supported —
     * consumers deduplicate and order by `source.ts_ns`.
     * @default "UNORDERED"
     */
    ordering?: dsql.StreamOrdering;
    /**
     * Record serialization format.
     * @default "JSON"
     */
    format?: dsql.StreamFormat;
    /**
     * User-defined tags for the stream.
     */
    tags?: Record<string, string>;
}
export interface Stream extends Resource<"AWS.DSQL.Stream", StreamProps, {
    /** Identifier of the source cluster. */
    clusterId: string;
    /** The unique stream identifier assigned by DSQL. */
    streamId: string;
    /** The ARN of the stream. */
    streamArn: string;
    /** The current status of the stream, e.g. `ACTIVE`. */
    status: string;
    /** Record ordering guarantee. */
    ordering: string;
    /** Record serialization format. */
    format: string;
    /** ARN of the target Kinesis data stream. */
    kinesisStreamArn: string;
    /** ARN of the IAM role DSQL assumes to write to Kinesis. */
    roleArn: string;
}, never, Providers> {
}
/**
 * A change data capture (CDC) stream on an Aurora DSQL cluster — delivers
 * committed row-level changes (Debezium-shaped JSON envelopes) to an Amazon
 * Kinesis data stream.
 *
 * Creation is asynchronous (`CREATING` -> `ACTIVE`, typically one to three
 * minutes); the provider waits for `ACTIVE` (bounded) before returning. A
 * stream has no update operation — every property except tags replaces it.
 *
 * Functions consume the change records through the existing Kinesis event
 * source on the **target** stream; DSQL itself never invokes compute
 * directly.
 *
 * ### Creating a CDC Stream
 * **Example:** Stream Cluster Changes into Kinesis
 * ```typescript
 * const cluster = yield* DSQL.Cluster("AppDb", {});
 * const target = yield* Kinesis.Stream("Changes", {
 *   streamMode: "ON_DEMAND",
 *   maxRecordSizeInKiB: 10240,
 * });
 * const role = yield* IAM.Role("CdcRole", {
 *   assumeRolePolicyDocument: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "dsql.amazonaws.com" },
 *         Action: "sts:AssumeRole",
 *       },
 *     ],
 *   }),
 *   inlinePolicies: {
 *     kinesis: JSON.stringify({
 *       Version: "2012-10-17",
 *       Statement: [
 *         {
 *           Effect: "Allow",
 *           Action: [
 *             "kinesis:PutRecord",
 *             "kinesis:PutRecords",
 *             "kinesis:DescribeStreamSummary",
 *             "kinesis:ListShards",
 *           ],
 *           Resource: target.streamArn,
 *         },
 *       ],
 *     }),
 *   },
 * });
 * const cdc = yield* DSQL.Stream("Cdc", {
 *   clusterId: cluster.clusterId,
 *   kinesisStreamArn: target.streamArn,
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * **Example:** Consume Change Records with a Function
 * ```typescript
 * // DSQL delivers into the Kinesis stream; consume it with the
 * // Kinesis event source on the target stream.
 * yield* Kinesis.consume(target, (records) =>
 *   Effect.forEach(records, (record) => handleChange(record)),
 * );
 * ```
 *
 * @resource
 */
export declare const Stream: import("../../Resource.ts").ResourceClass<Stream>;
export declare const StreamProvider: () => import("effect/Layer").Layer<Provider.Provider<Stream>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Stream.d.ts.map