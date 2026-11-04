import * as eventbridge from "@distilled.cloud/aws/eventbridge";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type { ApiDestinationHttpMethod, ApiDestinationState, } from "@distilled.cloud/aws/eventbridge";
export type ApiDestinationName = string;
export type ApiDestinationArn = `arn:aws:events:${RegionID}:${AccountID}:api-destination/${ApiDestinationName}/${string}`;
export interface ApiDestinationProps {
    /**
     * Name of the API destination. Must match [\.\-_A-Za-z0-9]+, 1-64
     * characters. If omitted, a unique name will be generated.
     */
    name?: ApiDestinationName;
    /**
     * Description of the API destination. Max 512 characters.
     */
    description?: string;
    /**
     * ARN of the {@link Connection} providing the endpoint's authorization.
     */
    connectionArn: string;
    /**
     * The HTTPS endpoint EventBridge invokes for events routed to this API
     * destination.
     */
    invocationEndpoint: string;
    /**
     * The HTTP method used against the endpoint.
     */
    httpMethod: eventbridge.ApiDestinationHttpMethod;
    /**
     * Maximum invocations per second EventBridge sends to the endpoint. The
     * unit (per second) is part of the AWS field's semantics — this is a rate
     * limit, not a duration.
     * @default 300
     */
    invocationRateLimitPerSecond?: number;
}
/**
 * An Amazon EventBridge API destination — an HTTPS endpoint configured as an
 * event target, invoked with the authorization held by a {@link Connection}.
 *
 * API destinations do not support tags, so ownership is tracked by the
 * deterministic physical name.
 * ### Connecting to APIs
 * **Example:** Webhook API Destination
 * ```typescript
 * const destination = yield* AWS.EventBridge.ApiDestination("Webhook", {
 *   connectionArn: connection.connectionArn,
 *   invocationEndpoint: "https://hooks.example.com/events",
 *   httpMethod: "POST",
 * });
 * ```
 *
 * **Example:** Rate-Limited API Destination as a Rule Target
 * ```typescript
 * const destination = yield* AWS.EventBridge.ApiDestination("SlowApi", {
 *   connectionArn: connection.connectionArn,
 *   invocationEndpoint: "https://api.example.com/ingest",
 *   httpMethod: "POST",
 *   invocationRateLimitPerSecond: 10,
 * });
 *
 * const rule = yield* AWS.EventBridge.Rule("ToApi", {
 *   eventPattern: { source: ["my.app"] },
 *   targets: [{
 *     Id: "Api",
 *     Arn: destination.apiDestinationArn,
 *     RoleArn: role.roleArn,
 *   }],
 * });
 * ```
 *
 * @resource
 */
export interface ApiDestination extends Resource<"AWS.EventBridge.ApiDestination", ApiDestinationProps, {
    /** The name of the API destination. */
    apiDestinationName: ApiDestinationName;
    /** The ARN of the API destination. */
    apiDestinationArn: ApiDestinationArn;
    /** The state of the API destination (`ACTIVE` or `INACTIVE`). */
    apiDestinationState: eventbridge.ApiDestinationState;
}, never, Providers> {
}
export declare const ApiDestination: import("../../Resource.ts").ResourceClass<ApiDestination>;
export declare const ApiDestinationProvider: () => import("effect/Layer").Layer<Provider.Provider<ApiDestination>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ApiDestination.d.ts.map