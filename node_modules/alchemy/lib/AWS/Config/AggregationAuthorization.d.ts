import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AggregationAuthorizationProps {
    /**
     * The 12-digit account ID of the aggregator account that is authorized to
     * collect AWS Config data from this account. Changing it replaces the
     * authorization.
     */
    authorizedAccountId: string;
    /**
     * The region of the aggregator account that is authorized to collect AWS
     * Config data from this account. Changing it replaces the authorization.
     */
    authorizedAwsRegion: string;
    /**
     * Tags to apply to the authorization. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface AggregationAuthorization extends Resource<"AWS.Config.AggregationAuthorization", AggregationAuthorizationProps, {
    /** ARN of the aggregation authorization. */
    aggregationAuthorizationArn: string;
    /** The aggregator account authorized to collect data. */
    authorizedAccountId: string;
    /** The aggregator region authorized to collect data. */
    authorizedAwsRegion: string;
}, never, Providers> {
}
/**
 * An AWS Config aggregation authorization that grants an aggregator account
 * in a specific region permission to collect AWS Config configuration and
 * compliance data from this account.
 *
 * The authorization's identity is the `(account, region)` pair — changing
 * either replaces it.
 * ### Authorizing an Aggregator
 * **Example:** Authorize an aggregator account
 * ```typescript
 * import * as Config from "alchemy/AWS/Config";
 *
 * const authorization = yield* Config.AggregationAuthorization(
 *   "OrgAggregator",
 *   {
 *     authorizedAccountId: "123456789012",
 *     authorizedAwsRegion: "us-east-1",
 *   },
 * );
 * ```
 *
 * @resource
 */
export declare const AggregationAuthorization: import("../../Resource.ts").ResourceClass<AggregationAuthorization>;
export declare const AggregationAuthorizationProvider: () => import("effect/Layer").Layer<Provider.Provider<AggregationAuthorization>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AggregationAuthorization.d.ts.map