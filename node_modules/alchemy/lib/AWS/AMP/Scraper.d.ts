import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ScraperEksSource {
    /**
     * ARN of the Amazon EKS cluster the scraper collects metrics from.
     */
    clusterArn: string;
    /**
     * IDs of the subnets the scraper's network interfaces are placed in. Must
     * be subnets of the cluster's VPC.
     */
    subnetIds: string[];
    /**
     * IDs of the security groups applied to the scraper's network interfaces.
     * If omitted, the cluster's default security group is used.
     */
    securityGroupIds?: string[];
}
export interface ScraperVpcSource {
    /**
     * IDs of the subnets the scraper's network interfaces are placed in.
     */
    subnetIds: string[];
    /**
     * IDs of the security groups applied to the scraper's network interfaces.
     */
    securityGroupIds: string[];
}
/**
 * Where the scraper collects metrics from — an Amazon EKS cluster or a
 * VPC-based source (Amazon MSK, self-managed Kubernetes, or any
 * Prometheus-compatible endpoint discoverable via DNS in the VPC).
 */
export type ScraperSource = {
    eksConfiguration: ScraperEksSource;
} | {
    vpcConfiguration: ScraperVpcSource;
};
export interface ScraperRoleConfiguration {
    /**
     * ARN of the role used by the scraper to discover and collect metrics on
     * your behalf (cross-account collection).
     */
    sourceRoleArn?: string;
    /**
     * ARN of the role used by the scraper to write to the destination
     * workspace (cross-account collection).
     */
    targetRoleArn?: string;
}
export interface ScraperProps {
    /**
     * A human-readable alias for the scraper. Aliases are not unique.
     * Updating the alias is an in-place update.
     */
    alias?: string;
    /**
     * The scraper's configuration as Prometheus scrape-configuration YAML
     * text. It is base64-blob encoded on the wire automatically. Use the
     * {@link GetDefaultScraperConfiguration} binding (or the
     * `GetDefaultScraperConfiguration` API) to fetch the AWS-managed default
     * as a starting point. Updating the configuration is an in-place update.
     */
    scrapeConfiguration: string;
    /**
     * Where the scraper collects metrics from. The source is immutable —
     * changing it replaces the scraper.
     */
    source: ScraperSource;
    /**
     * ARN of the Amazon Managed Service for Prometheus workspace the scraped
     * metrics are written to. Updating the destination is an in-place update.
     */
    destinationWorkspaceArn: string;
    /**
     * Cross-account role configuration for the scraper. If omitted, the
     * scraper collects and writes within the current account using the
     * service-created role.
     */
    roleConfiguration?: ScraperRoleConfiguration;
    /**
     * User-defined tags for the scraper.
     */
    tags?: Record<string, string>;
}
export interface Scraper extends Resource<"AWS.AMP.Scraper", ScraperProps, {
    scraperId: string;
    scraperArn: string;
    roleArn: string;
    alias: string | undefined;
    status: string;
}, never, Providers> {
}
/**
 * An Amazon Managed Service for Prometheus scraper — a fully-managed,
 * agentless collector that pulls metrics from an Amazon EKS cluster (or a
 * VPC-based Prometheus-compatible source) and remote-writes them into an AMP
 * workspace.
 *
 * Scraper provisioning is slow (the service creates network interfaces and
 * an IAM role; expect several minutes to reach `ACTIVE`).
 *
 * ### Creating a Scraper
 * **Example:** Scrape an EKS Cluster into a Workspace
 * ```typescript
 * const workspace = yield* AMP.Workspace("Metrics", {});
 * const scraper = yield* AMP.Scraper("ClusterScraper", {
 *   alias: "eks-metrics",
 *   scrapeConfiguration: defaultScrapeConfigYaml,
 *   source: {
 *     eksConfiguration: {
 *       clusterArn: cluster.clusterArn,
 *       subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *     },
 *   },
 *   destinationWorkspaceArn: workspace.workspaceArn,
 * });
 * ```
 *
 * **Example:** Scrape a VPC-Based Source
 * ```typescript
 * const scraper = yield* AMP.Scraper("VpcScraper", {
 *   scrapeConfiguration: scrapeConfigYaml,
 *   source: {
 *     vpcConfiguration: {
 *       subnetIds: [subnet.subnetId],
 *       securityGroupIds: [securityGroup.securityGroupId],
 *     },
 *   },
 *   destinationWorkspaceArn: workspace.workspaceArn,
 * });
 * ```
 *
 * @resource
 */
export declare const Scraper: import("../../Resource.ts").ResourceClass<Scraper>;
export declare const ScraperProvider: () => import("effect/Layer").Layer<Provider.Provider<Scraper>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Scraper.d.ts.map