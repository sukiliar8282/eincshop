import * as mcn from "@distilled.cloud/cloudflare/magic-cloud-networking";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.MagicCloudNetworking.CloudIntegration";
type TypeId = typeof TypeId;
/**
 * The cloud provider an integration discovers resources from.
 */
export type CloudIntegrationCloudType = "AWS" | "AZURE" | "GOOGLE" | "CLOUDFLARE";
/**
 * Lifecycle state of a cloud integration.
 */
export type CloudIntegrationLifecycleState = "ACTIVE" | "PENDING_SETUP" | "RETIRED";
/**
 * Discovery state of a cloud integration.
 */
export type CloudIntegrationState = "UNSPECIFIED" | "PENDING" | "DISCOVERING" | "FAILED" | "SUCCEEDED";
export interface CloudIntegrationProps {
    /**
     * The cloud provider this integration connects to.
     *
     * Immutable — changing the cloud type triggers a replacement.
     */
    cloudType: CloudIntegrationCloudType;
    /**
     * Human readable name for the integration. Used as the integration's
     * identity for cold-state recovery, so it should be unique within the
     * account. If omitted, a unique name is generated from the app, stage,
     * and logical ID.
     * @default ${app}-${stage}-${id}
     */
    friendlyName?: string;
    /**
     * Free-form description of the integration. Mutable.
     */
    description?: string;
    /**
     * AWS IAM role ARN Cloudflare assumes to discover resources
     * (`cloudType: "AWS"` only). Mutable — wired after creating the role
     * from the integration's setup data.
     */
    awsArn?: string;
    /**
     * Azure subscription to discover (`cloudType: "AZURE"` only). Mutable.
     */
    azureSubscriptionId?: string;
    /**
     * Azure tenant the subscription belongs to (`cloudType: "AZURE"` only).
     * Mutable.
     */
    azureTenantId?: string;
    /**
     * GCP project to discover (`cloudType: "GOOGLE"` only). Mutable.
     */
    gcpProjectId?: string;
    /**
     * GCP service account email Cloudflare impersonates
     * (`cloudType: "GOOGLE"` only). Mutable.
     */
    gcpServiceAccountEmail?: string;
}
export interface CloudIntegrationAttributes {
    /** Cloudflare-assigned identifier of the integration. */
    integrationId: string;
    /** The Cloudflare account the integration belongs to. */
    accountId: string;
    /** The cloud provider this integration connects to. */
    cloudType: CloudIntegrationCloudType;
    /** Human readable name of the integration. */
    friendlyName: string;
    /** Free-form description, if set. */
    description: string | undefined;
    /** Lifecycle state (`PENDING_SETUP` until credentials are wired). */
    lifecycleState: CloudIntegrationLifecycleState;
    /** State of the most recent discovery run. */
    state: CloudIntegrationState;
    /** AWS IAM role ARN used for discovery, if wired. */
    awsArn: string | undefined;
    /** Azure subscription being discovered, if wired. */
    azureSubscriptionId: string | undefined;
    /** Azure tenant of the subscription, if wired. */
    azureTenantId: string | undefined;
    /** GCP project being discovered, if wired. */
    gcpProjectId: string | undefined;
    /** GCP service account email used for discovery, if wired. */
    gcpServiceAccountEmail: string | undefined;
    /** ISO8601 timestamp of the last change to the integration. */
    lastUpdated: string;
}
export type CloudIntegration = Resource<TypeId, CloudIntegrationProps, CloudIntegrationAttributes, never, Providers>;
/**
 * A Magic Cloud Networking cloud integration — registers an AWS, Azure, or
 * GCP account with Cloudflare so Magic Cloud Networking can discover its
 * networking resources (VPCs, subnets, gateways, …).
 *
 * Creating an integration returns provider-side setup data; credential
 * wiring (`awsArn`, `azureSubscriptionId`/`azureTenantId`,
 * `gcpProjectId`/`gcpServiceAccountEmail`) is applied in place. Only
 * `cloudType` forces a replacement.
 *
 * Magic Cloud Networking is an entitlement-gated add-on (Magic WAN family).
 * On accounts without the entitlement every API call fails with the typed
 * `FeatureNotEnabled` error (Cloudflare code 1012, "feature not enabled").
 * ### Creating an integration
 * **Example:** Register an AWS account
 * ```typescript
 * const aws = yield* Cloudflare.MagicCloudNetworking.CloudIntegration("Discovery", {
 *   cloudType: "AWS",
 *   description: "production AWS account",
 * });
 * // aws.lifecycleState === "PENDING_SETUP" until credentials are wired
 * ```
 *
 * **Example:** Wire credentials after creating the IAM role
 * ```typescript
 * yield* Cloudflare.MagicCloudNetworking.CloudIntegration("Discovery", {
 *   cloudType: "AWS",
 *   awsArn: "arn:aws:iam::123456789012:role/cloudflare-mcn-discovery",
 * });
 * ```
 *
 * ### GCP
 * **Example:** Register a GCP project
 * ```typescript
 * yield* Cloudflare.MagicCloudNetworking.CloudIntegration("GcpDiscovery", {
 *   cloudType: "GOOGLE",
 *   gcpProjectId: "my-project",
 *   gcpServiceAccountEmail: "mcn@my-project.iam.gserviceaccount.com",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-cloud-networking/
 *
 * @resource
 * @product Magic Cloud Networking
 * @category Network
 */
export declare const CloudIntegration: import("../../Resource.ts").ResourceClass<CloudIntegration>;
/**
 * Returns true if the given value is a CloudIntegration resource.
 */
export declare const isCloudIntegration: (value: unknown) => value is CloudIntegration;
export declare const CloudIntegrationProvider: () => import("effect/Layer").Layer<Provider.Provider<CloudIntegration>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | mcn.CloudflareOpContext>;
export {};
//# sourceMappingURL=CloudIntegration.d.ts.map