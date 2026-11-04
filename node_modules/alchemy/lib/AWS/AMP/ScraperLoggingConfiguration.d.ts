import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ScraperComponentConfig {
    /**
     * The scraper component the logging applies to (e.g. `"SERVICE_DISCOVERY"`,
     * `"COLLECTOR"`, `"EXPORTER"`).
     */
    type: string;
    /**
     * Component-specific options (e.g. `{ loggingLevel: "DEBUG" }`).
     */
    options?: Record<string, string>;
}
export interface ScraperLoggingConfigurationProps {
    /**
     * Id of the AMP scraper whose component logs are shipped. A scraper has
     * at most one logging configuration. Changing the scraper replaces the
     * configuration.
     */
    scraperId: string;
    /**
     * ARN of the CloudWatch Logs log group that receives the scraper's
     * component logs. AMP expects the ARN with a trailing `:*` — one is
     * appended automatically when missing.
     */
    logGroupArn: string;
    /**
     * Per-component logging configuration. If omitted, the service default
     * component set is logged.
     */
    components?: ScraperComponentConfig[];
}
export interface ScraperLoggingConfiguration extends Resource<"AWS.AMP.ScraperLoggingConfiguration", ScraperLoggingConfigurationProps, {
    scraperId: string;
    logGroupArn: string;
    status: string;
}, never, Providers> {
}
/**
 * The logging configuration of an Amazon Managed Service for Prometheus
 * scraper — ships the scraper's component logs (service discovery,
 * collection, export) to a CloudWatch Logs log group. A scraper has at most
 * one.
 *
 * ### Creating a Scraper Logging Configuration
 * **Example:** Ship Scraper Logs to CloudWatch Logs
 * ```typescript
 * const logs = yield* Logs.LogGroup("ScraperLogs", {
 *   logGroupName: "/aws/vendedlogs/prometheus/scraper",
 * });
 * const logging = yield* AMP.ScraperLoggingConfiguration("ScraperLogging", {
 *   scraperId: scraper.scraperId,
 *   logGroupArn: logs.logGroupArn,
 * });
 * ```
 *
 * @resource
 */
export declare const ScraperLoggingConfiguration: import("../../Resource.ts").ResourceClass<ScraperLoggingConfiguration>;
export declare const ScraperLoggingConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<ScraperLoggingConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ScraperLoggingConfiguration.d.ts.map