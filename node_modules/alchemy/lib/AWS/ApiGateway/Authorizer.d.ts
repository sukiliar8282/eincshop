import * as ag from "@distilled.cloud/aws/api-gateway";
import type * as Duration from "effect/Duration";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AuthorizerProps {
    /**
     * REST API identifier that owns the authorizer.
     */
    restApiId: Input<string>;
    /**
     * Authorizer name.
     *
     * If omitted, Alchemy generates a deterministic physical name.
     */
    name?: string;
    /**
     * Authorizer type.
     */
    type: ag.AuthorizerType;
    /**
     * Cognito user pool ARNs for `COGNITO_USER_POOLS` authorizers.
     */
    providerARNs?: string[];
    /**
     * Custom authorization type label.
     */
    authType?: string;
    /**
     * Lambda invocation URI for `TOKEN` or `REQUEST` authorizers.
     */
    authorizerUri?: string;
    /**
     * IAM role ARN used by API Gateway to invoke the authorizer.
     *
     * This is not secret key material; API Gateway stores the role ARN.
     */
    authorizerCredentials?: string;
    /**
     * Identity source expression, e.g. `method.request.header.Authorization`.
     */
    identitySource?: string;
    /**
     * Validation regex for token authorizers.
     */
    identityValidationExpression?: string;
    /**
     * Cache TTL for authorizer results (e.g. `"5 minutes"` or
     * `Duration.seconds(300)`; a bare number is milliseconds). Sent to the
     * API as whole seconds (`authorizerResultTtlInSeconds`).
     */
    authorizerResultTtl?: Duration.Input;
}
/** @resource */
export interface Authorizer extends Resource<"AWS.ApiGateway.Authorizer", AuthorizerProps, {
    authorizerId: string;
    restApiId: string;
    name: string;
    type: ag.AuthorizerType;
}, never, Providers> {
}
/**
 * REST API Lambda, Cognito, or gateway authorizer.
 *
 * ### Authorizers
 * **Example:** Lambda TOKEN authorizer
 * ```typescript
 * const authorizer = yield* ApiGateway.Authorizer("Auth", {
 *   restApiId: api.restApiId,
 *   type: "TOKEN",
 *   authorizerUri: authorizerInvokeArn,
 *   identitySource: "method.request.header.Authorization",
 * });
 * ```
 */
declare const AuthorizerResource: import("../../Resource.ts").ResourceClass<Authorizer>;
export { AuthorizerResource as Authorizer };
export declare const AuthorizerProvider: () => import("effect/Layer").Layer<Provider.Provider<Authorizer>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Authorizer.d.ts.map