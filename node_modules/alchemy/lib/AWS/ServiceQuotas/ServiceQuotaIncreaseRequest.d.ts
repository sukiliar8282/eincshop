import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ServiceQuotaIncreaseRequestProps {
    /**
     * Service identifier the quota belongs to, e.g. `"vpc"`, `"lambda"`,
     * `"ec2"`. Discover codes with `servicequotas.listServices`.
     * Changing this replaces the resource.
     */
    serviceCode: string;
    /**
     * Quota identifier, e.g. `"L-F678F1CE"` (VPCs per region).
     * Discover codes with `servicequotas.listServiceQuotas`.
     * Changing this replaces the resource.
     */
    quotaCode: string;
    /**
     * The new quota value to request. Must be greater than the currently
     * applied value. If the applied quota already meets or exceeds this value
     * no request is submitted. Raising it later submits a new request.
     */
    desiredValue: number;
    /**
     * Resource context for resource-level quotas (e.g. an EC2 instance family
     * or an OpenSearch domain ARN). Omit for account-level quotas.
     * Changing this replaces the resource.
     */
    contextId?: string;
    /**
     * Whether AWS may open a support case for the request when it cannot be
     * auto-approved.
     * @default AWS decides (a case is opened when required)
     */
    supportCaseAllowed?: boolean;
}
export interface ServiceQuotaIncreaseRequest extends Resource<"AWS.ServiceQuotas.ServiceQuotaIncreaseRequest", ServiceQuotaIncreaseRequestProps, {
    /**
     * ID of the quota increase request. Undefined when the applied quota
     * already met the desired value and no request was needed.
     */
    requestId: string | undefined;
    /**
     * Request status: `PENDING`, `CASE_OPENED`, `APPROVED`, `DENIED`,
     * `CASE_CLOSED`, `NOT_APPROVED` or `INVALID_REQUEST`. Undefined when no
     * request was needed.
     */
    status: string | undefined;
    /** Support case ID, when the request opened a case. */
    caseId: string | undefined;
    /** Service identifier the quota belongs to. */
    serviceCode: string;
    /** Quota identifier. */
    quotaCode: string;
    /** The requested (desired) quota value. */
    desiredValue: number;
    /**
     * The applied quota value observed at last reconcile (the AWS default
     * value when no account override is applied).
     */
    appliedValue: number | undefined;
    /** ARN of the quota. */
    quotaArn: string | undefined;
    /** Human-readable quota name. */
    quotaName: string | undefined;
    /** Human-readable service name. */
    serviceName: string | undefined;
    /** Unit of measurement of the quota value. */
    unit: string | undefined;
    /** Whether the quota is global (not region-scoped). */
    globalQuota: boolean | undefined;
}, never, Providers> {
}
/**
 * A Service Quotas quota increase request at the account or resource level.
 *
 * :::caution
 * Submitting a quota increase request may open an AWS Support case and
 * **cannot be cancelled through the Service Quotas API**. Destroying this
 * resource only forgets the request — a still-open request (and its support
 * case, if any) lives on in AWS.
 * :::
 *
 * The reconciler is idempotent: it first observes the applied quota value
 * and any open request for the quota. A new request is submitted only when
 * the applied value is below `desiredValue` and no open request already
 * asks for it. Raising `desiredValue` later submits a new request.
 *
 * ### Requesting a Quota Increase
 * **Example:** Raise the VPCs-per-region quota
 * ```typescript
 * const increase = yield* ServiceQuotas.ServiceQuotaIncreaseRequest("MoreVpcs", {
 *   serviceCode: "vpc",
 *   quotaCode: "L-F678F1CE",
 *   desiredValue: 10,
 * });
 * ```
 *
 * **Example:** Request without allowing a support case
 * ```typescript
 * const increase = yield* ServiceQuotas.ServiceQuotaIncreaseRequest("MoreFunctions", {
 *   serviceCode: "lambda",
 *   quotaCode: "L-B99A9384",
 *   desiredValue: 2000,
 *   supportCaseAllowed: false,
 * });
 * ```
 */
export declare const ServiceQuotaIncreaseRequest: import("../../Resource.ts").ResourceClass<ServiceQuotaIncreaseRequest>;
export declare const ServiceQuotaIncreaseRequestProvider: () => import("effect/Layer").Layer<Provider.Provider<ServiceQuotaIncreaseRequest>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ServiceQuotaIncreaseRequest.d.ts.map