import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ResourcePolicyProps {
    /**
     * Name of the CloudWatch RUM app monitor the policy is attached to. An app
     * monitor has at most one resource-based policy. Changing the app monitor
     * replaces the policy.
     */
    appMonitorName: string;
    /**
     * The IAM resource-based policy document (JSON) that controls who may send
     * events to the app monitor. RUM only accepts `rum:PutRumEvents` as the
     * statement action. Updated in place. Maximum size is 4 KB.
     */
    policyDocument: string;
}
export interface ResourcePolicy extends Resource<"AWS.RUM.ResourcePolicy", ResourcePolicyProps, {
    /**
     * Name of the app monitor the policy is attached to.
     */
    appMonitorName: string;
    /**
     * Revision id of the policy document, changed on every update.
     */
    policyRevisionId: string | undefined;
}, never, Providers> {
}
/**
 * The resource-based policy of a CloudWatch RUM app monitor — controls which
 * principals may send events to (`rum:PutRumEvents`) or read data from the
 * app monitor. An app monitor has at most one.
 *
 * ### Creating a Resource Policy
 * **Example:** Allow the Account to Send RUM Events
 * ```typescript
 * const monitor = yield* RUM.AppMonitor("SiteMonitor", {
 *   domain: "example.com",
 * });
 * const policy = yield* RUM.ResourcePolicy("SitePolicy", {
 *   appMonitorName: monitor.appMonitorName,
 *   policyDocument: monitor.appMonitorArn.map((arn) =>
 *     JSON.stringify({
 *       Version: "2012-10-17",
 *       Statement: [
 *         {
 *           Effect: "Allow",
 *           Principal: { AWS: "arn:aws:iam::123456789012:root" },
 *           Action: ["rum:PutRumEvents"],
 *           Resource: arn,
 *         },
 *       ],
 *     }),
 *   ),
 * });
 * ```
 *
 * @resource
 */
export declare const ResourcePolicy: import("../../Resource.ts").ResourceClass<ResourcePolicy>;
export declare const ResourcePolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<ResourcePolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ResourcePolicy.d.ts.map