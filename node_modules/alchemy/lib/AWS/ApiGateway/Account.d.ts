import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AccountProps {
    /**
     * IAM role ARN for API Gateway to push logs to CloudWatch.
     */
    cloudwatchRoleArn?: string;
}
/** @resource */
export interface Account extends Resource<"AWS.ApiGateway.Account", AccountProps, {
    cloudwatchRoleArn: string | undefined;
    /**
     * True when this stack last applied a desired `cloudwatchRoleArn` (including clearing it).
     * Used so destroy does not remove a role the stack never configured.
     */
    managesCloudwatchRoleArn: boolean;
}, never, Providers> {
}
/**
 * Account-level settings for Amazon API Gateway in the current region
 * (CloudWatch logging role, etc.).
 *
 * ### Account settings
 * **Example:** Set logging role
 * ```typescript
 * yield* ApiGateway.Account("Account", {
 *   cloudwatchRoleArn: role.roleArn,
 * });
 * ```
 */
declare const AccountResource: import("../../Resource.ts").ResourceClass<Account>;
export { AccountResource as Account };
export declare const AccountProvider: () => import("effect/Layer").Layer<Provider.Provider<Account>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Account.d.ts.map