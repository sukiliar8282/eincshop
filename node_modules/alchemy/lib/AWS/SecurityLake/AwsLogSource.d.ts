import * as securitylake from "@distilled.cloud/aws/securitylake";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * A natively supported AWS log source that Security Lake can collect.
 */
export type AwsLogSourceName = securitylake.AwsLogSourceName;
export interface AwsLogSourceProps {
    /**
     * The AWS service to collect logs from (e.g. `ROUTE53`, `VPC_FLOW`,
     * `CLOUD_TRAIL_MGMT`, `SH_FINDINGS`, `LAMBDA_EXECUTION`, `S3_DATA`,
     * `EKS_AUDIT`, `WAF`). Changing this replaces the log source.
     */
    sourceName: AwsLogSourceName;
    /**
     * The version of the source schema to collect. Changing this replaces the
     * log source.
     * @default - the latest version supported by Security Lake
     */
    sourceVersion?: string;
    /**
     * The Regions to collect this source in. Security Lake must already be
     * enabled (via `SecurityLake.DataLake`) in each Region.
     */
    regions: string[];
    /**
     * The AWS account IDs to collect this source from.
     * @default - the current account
     */
    accounts?: string[];
}
/** @resource */
export interface AwsLogSource extends Resource<"AWS.SecurityLake.AwsLogSource", AwsLogSourceProps, {
    /** The AWS service the source collects logs from. */
    sourceName: string;
    /** The resolved source schema version. */
    sourceVersion: string | undefined;
    /** The Regions the source is enabled in. */
    regions: string[];
    /** The account IDs the source is collected from (undefined = current). */
    accounts: string[] | undefined;
}, never, Providers> {
}
/**
 * A natively supported AWS log source (Route 53, VPC Flow Logs, CloudTrail,
 * Security Hub findings, ...) enabled for collection into the Security Lake
 * data lake. Requires `SecurityLake.DataLake` to already be enabled in every
 * configured Region.
 *
 * ### Collecting AWS logs
 * **Example:** Route 53 resolver query logs
 * ```typescript
 * const lake = yield* SecurityLake.DataLake("Lake", {
 *   configurations: [{ region: "us-west-2" }],
 *   metaStoreManagerRoleArn: metastoreRole.roleArn,
 * });
 * const route53 = yield* SecurityLake.AwsLogSource("Route53Logs", {
 *   sourceName: "ROUTE53",
 *   regions: lake.regions,
 * });
 * ```
 *
 * **Example:** VPC Flow Logs from specific accounts
 * ```typescript
 * const vpcFlow = yield* SecurityLake.AwsLogSource("VpcFlow", {
 *   sourceName: "VPC_FLOW",
 *   sourceVersion: "2.0",
 *   regions: ["us-west-2", "us-east-1"],
 *   accounts: ["123456789012"],
 * });
 * ```
 */
declare const AwsLogSourceResource: import("../../Resource.ts").ResourceClass<AwsLogSource>;
export { AwsLogSourceResource as AwsLogSource };
declare const AwsLogSourceOperationFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AwsLogSourceOperationFailed";
} & Readonly<A>;
/**
 * Security Lake reported per-account failures when enabling or disabling an
 * AWS log source.
 */
export declare class AwsLogSourceOperationFailed extends AwsLogSourceOperationFailed_base<{
    readonly operation: "create" | "delete";
    readonly sourceName: string;
    readonly failedAccounts: string[];
}> {
}
export declare const AwsLogSourceProvider: () => import("effect/Layer").Layer<Provider.Provider<AwsLogSource>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=AwsLogSource.d.ts.map