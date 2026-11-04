import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface DiscoveryProps {
}
export interface Discovery extends Resource<"AWS.ApplicationSignals.Discovery", DiscoveryProps, {
    /**
     * The AWS account in which Application Signals discovery was enabled.
     */
    accountId: string;
    /**
     * The region in which Application Signals discovery was enabled.
     */
    region: string;
}, never, Providers> {
}
/**
 * Enables CloudWatch Application Signals for this account by creating the
 * `AWSServiceRoleForCloudWatchApplicationSignals` service-linked role and the
 * service-linked CloudTrail event channel used for change-event correlation
 * (mirrors CloudFormation's `AWS::ApplicationSignals::Discovery`).
 *
 * `StartDiscovery` is idempotent, and AWS provides no API to disable
 * discovery or observe its enablement, so this resource is
 * provision-only: deleting it from the stack leaves discovery enabled
 * (the delete is a no-op, matching CloudFormation's behavior).
 *
 * ### Enabling Application Signals
 * **Example:** Enable Discovery for the Account
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const discovery = yield* AWS.ApplicationSignals.Discovery("Discovery", {});
 * ```
 *
 * @resource
 */
export declare const Discovery: import("../../Resource.ts").ResourceClass<Discovery>;
export declare const DiscoveryProvider: () => import("effect/Layer").Layer<Provider.Provider<Discovery>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Discovery.d.ts.map