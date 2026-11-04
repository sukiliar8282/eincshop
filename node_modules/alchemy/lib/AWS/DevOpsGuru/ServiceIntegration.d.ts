import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ServiceIntegrationProps {
    /**
     * Create an AWS Systems Manager OpsItem for each new insight so incidents
     * flow into OpsCenter.
     * @default false
     */
    opsCenter?: boolean;
    /**
     * Analyze CloudWatch log groups in the resource collection for log
     * anomalies and surface them on insights.
     * @default false
     */
    logsAnomalyDetection?: boolean;
    /**
     * Encrypt DevOps Guru data with this customer-managed KMS key instead of
     * the AWS-owned default key. Omit to use the AWS-owned key.
     */
    kmsKeyId?: string;
}
export interface ServiceIntegration extends Resource<"AWS.DevOpsGuru.ServiceIntegration", ServiceIntegrationProps, {
    /** Whether an OpsItem is created for each new insight. */
    opsCenter: boolean;
    /** Whether CloudWatch log groups are analyzed for anomalies. */
    logsAnomalyDetection: boolean;
    /** Server-side encryption key type (`AWS_OWNED_KMS_KEY` or `CUSTOMER_MANAGED_KEY`). */
    encryptionType: devopsguru.ServerSideEncryptionType;
    /** Customer-managed KMS key id, when `encryptionType` is `CUSTOMER_MANAGED_KEY`. */
    kmsKeyId: string | undefined;
}, never, Providers> {
}
/**
 * The DevOps Guru service integration — the account/region singleton that
 * controls how DevOps Guru integrates with other AWS services: creating a
 * Systems Manager OpsItem for each insight, analyzing CloudWatch log groups
 * for anomalies, and encrypting DevOps Guru data with a customer-managed
 * KMS key.
 *
 * An account has exactly one integration configuration, so this resource is
 * a capture-and-restore singleton: adopting a non-default configuration that
 * Alchemy did not create requires `--adopt`. Destroying the resource
 * restores the account defaults (everything disabled, AWS-owned key).
 *
 * ### Configuring the Integration
 * **Example:** Enable Log Anomaly Detection
 * ```typescript
 * const integration = yield* DevOpsGuru.ServiceIntegration("Integration", {
 *   logsAnomalyDetection: true,
 * });
 * ```
 *
 * **Example:** File an OpsItem for Every Insight
 * ```typescript
 * const integration = yield* DevOpsGuru.ServiceIntegration("Integration", {
 *   opsCenter: true,
 *   logsAnomalyDetection: true,
 * });
 * ```
 *
 * **Example:** Encrypt with a Customer-Managed Key
 * ```typescript
 * const integration = yield* DevOpsGuru.ServiceIntegration("Integration", {
 *   kmsKeyId: key.keyId,
 * });
 * ```
 *
 * @resource
 */
export declare const ServiceIntegration: import("../../Resource.ts").ResourceClass<ServiceIntegration>;
export declare const ServiceIntegrationProvider: () => import("effect/Layer").Layer<Provider.Provider<ServiceIntegration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ServiceIntegration.d.ts.map