import * as im from "@distilled.cloud/aws/internetmonitor";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface MonitorProps {
    /**
     * Name of the monitor. Must be 1-255 characters of letters, digits,
     * hyphens (-), periods (.) and underscores (_). If omitted, a
     * deterministic physical name is generated. Changing the name replaces
     * the monitor.
     */
    monitorName?: string;
    /**
     * ARNs of the resources to monitor — VPCs, Network Load Balancers,
     * CloudFront distributions, or Amazon WorkSpaces directories. Added and
     * removed in place via UpdateMonitor.
     * @default [] — no resources are monitored until some are added
     */
    resources?: string[];
    /**
     * The maximum number of city-networks (client locations and ASNs,
     * typically ISPs) to monitor for your resources. Caps the total traffic
     * that Internet Monitor monitors (and therefore the cost). You must set
     * either this or `trafficPercentageToMonitor`.
     */
    maxCityNetworksToMonitor?: number;
    /**
     * The percentage of the internet-facing traffic for your application to
     * monitor. You must set either this or `maxCityNetworksToMonitor`.
     */
    trafficPercentageToMonitor?: number;
    /**
     * Publish internet measurements for the monitor to an Amazon S3 bucket
     * (in addition to CloudWatch Logs).
     */
    internetMeasurementsLogDelivery?: im.InternetMeasurementsLogDelivery;
    /**
     * Health-event thresholds — the percentage of overall traffic impact at
     * which the monitor creates availability or performance health events.
     * @default AWS creates health events at a 95% threshold
     */
    healthEventsConfig?: im.HealthEventsConfig;
    /**
     * Desired state of the monitor — `"ACTIVE"` (monitoring) or
     * `"INACTIVE"` (paused). Toggled in place via UpdateMonitor.
     * @default "ACTIVE"
     */
    status?: "ACTIVE" | "INACTIVE";
    /**
     * User-defined tags for the monitor.
     */
    tags?: Record<string, string>;
}
export interface Monitor extends Resource<"AWS.InternetMonitor.Monitor", MonitorProps, {
    /** The name of the monitor. */
    monitorName: string;
    /** The ARN of the monitor. */
    monitorArn: string;
    /** The current status of the monitor (`ACTIVE`, `INACTIVE`, ...). */
    status: string;
    /** The health-event data-processing status of the monitor. */
    processingStatus: string | undefined;
    /** The ARNs of the resources the monitor watches. */
    resources: string[];
    /** The effective cap on monitored city-networks. */
    maxCityNetworksToMonitor: number | undefined;
    /** The effective percentage of traffic monitored. */
    trafficPercentageToMonitor: number | undefined;
    /** The tags applied to the monitor. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon CloudWatch Internet Monitor **monitor** — measures internet
 * availability and performance between your AWS-hosted application and your
 * end users' city-networks (client locations and ASNs, typically ISPs).
 *
 * A monitor is built from the application resources you add to it: VPCs,
 * Network Load Balancers, CloudFront distributions, or WorkSpaces
 * directories. Cost is controlled by capping the number of monitored
 * city-networks (`maxCityNetworksToMonitor`) or the percentage of traffic
 * monitored (`trafficPercentageToMonitor`).
 *
 * ### Creating a Monitor
 * **Example:** Monitor for a VPC
 * ```typescript
 * import * as InternetMonitor from "alchemy/AWS/InternetMonitor";
 *
 * const monitor = yield* InternetMonitor.Monitor("AppMonitor", {
 *   resources: [`arn:aws:ec2:us-east-1:123456789012:vpc/${vpc.vpcId}`],
 *   maxCityNetworksToMonitor: 100,
 * });
 * ```
 *
 * **Example:** Monitor a percentage of traffic
 * ```typescript
 * const monitor = yield* InternetMonitor.Monitor("AppMonitor", {
 *   resources: [cloudfrontDistributionArn],
 *   trafficPercentageToMonitor: 50,
 * });
 * ```
 *
 * ### Health Events
 * **Example:** Custom health-event thresholds
 * ```typescript
 * const monitor = yield* InternetMonitor.Monitor("AppMonitor", {
 *   resources: [vpcArn],
 *   maxCityNetworksToMonitor: 100,
 *   healthEventsConfig: {
 *     AvailabilityScoreThreshold: 90,
 *     PerformanceScoreThreshold: 90,
 *   },
 * });
 * ```
 *
 * ### Log Delivery
 * **Example:** Publish measurements to S3
 * ```typescript
 * const monitor = yield* InternetMonitor.Monitor("AppMonitor", {
 *   resources: [vpcArn],
 *   maxCityNetworksToMonitor: 100,
 *   internetMeasurementsLogDelivery: {
 *     S3Config: {
 *       BucketName: bucket.bucketName,
 *       LogDeliveryStatus: "ENABLED",
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Monitor: import("../../Resource.ts").ResourceClass<Monitor>;
export declare const MonitorProvider: () => import("effect/Layer").Layer<Provider.Provider<Monitor>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Monitor.d.ts.map