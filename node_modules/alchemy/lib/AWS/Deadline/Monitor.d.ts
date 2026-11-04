import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface MonitorProps {
    /**
     * Display name of the monitor, shown on its web page.
     * @default ${app}-${stage}-${id}
     */
    displayName?: string;
    /**
     * Subdomain the monitor URL is served under
     * (`https://{subdomain}.{region}.deadlinecloud.amazonaws.com`).
     */
    subdomain: string;
    /**
     * ARN of the IAM Identity Center instance responsible for authenticating
     * monitor users. Changing it replaces the monitor.
     */
    identityCenterInstanceArn: string;
    /**
     * Region of the IAM Identity Center instance, when it differs from the
     * monitor's region.
     */
    identityCenterRegion?: string;
    /**
     * ARN of the IAM role the monitor assumes on behalf of signed-in users.
     */
    roleArn: string;
    /**
     * Tags to associate with the monitor.
     */
    tags?: Record<string, string>;
}
export interface Monitor extends Resource<"AWS.Deadline.Monitor", MonitorProps, {
    /**
     * Service-assigned unique identifier of the monitor (`monitor-...`).
     */
    monitorId: string;
    /**
     * ARN of the monitor.
     */
    monitorArn: string;
    /**
     * The monitor's display name.
     */
    displayName: string;
    /**
     * The configured subdomain.
     */
    subdomain: string;
    /**
     * Full URL of the monitor's web page.
     */
    url: string;
    /**
     * ARN of the monitor's user role.
     */
    roleArn: string;
    /**
     * ARN of the IAM Identity Center instance backing sign-in.
     */
    identityCenterInstanceArn: string;
    /**
     * ARN of the Identity Center application the monitor registered.
     */
    identityCenterApplicationArn: string;
    /**
     * Current tags reported for the monitor.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Deadline Cloud monitor — the hosted web console where artists and
 * administrators view farms, queues, and jobs, authenticated through IAM
 * Identity Center.
 *
 * ### Creating Monitors
 * **Example:** Basic Monitor
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const monitor = yield* AWS.Deadline.Monitor("StudioMonitor", {
 *   subdomain: "studio-renders",
 *   identityCenterInstanceArn: "arn:aws:sso:::instance/ssoins-1234567890abcdef",
 *   roleArn: monitorRole.roleArn,
 * });
 * ```
 *
 * **Example:** Export the Monitor URL
 * ```typescript
 * // The monitor's web console URL is available as an output attribute —
 * // return it from the stack so users know where to sign in.
 * const monitor = yield* AWS.Deadline.Monitor("StudioMonitor", {
 *   subdomain: "studio-renders",
 *   identityCenterInstanceArn: identityCenterArn,
 *   roleArn: monitorRole.roleArn,
 * });
 * return { monitorUrl: monitor.url };
 * ```
 *
 * @resource
 */
export declare const Monitor: import("../../Resource.ts").ResourceClass<Monitor>;
export declare const MonitorProvider: () => import("effect/Layer").Layer<Provider.Provider<Monitor>, never, import("../Environment.ts").AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Monitor.d.ts.map