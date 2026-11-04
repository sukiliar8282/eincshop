import * as ag from "@distilled.cloud/aws/api-gateway";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface GatewayResponseProps {
    /** ID of the REST API the response mapping belongs to. */
    restApiId: Input<string>;
    /** The gateway response type to customize (e.g. `DEFAULT_4XX`, `ACCESS_DENIED`). */
    responseType: ag.GatewayResponseType;
    /** HTTP status code to return; defaults to the response type's standard code. */
    statusCode?: string;
    /** Response header parameters (e.g. `gatewayresponse.header.X-Foo`) as mapping expressions. */
    responseParameters?: {
        [key: string]: string | undefined;
    };
    /** Response body mapping templates keyed by content type. */
    responseTemplates?: {
        [key: string]: string | undefined;
    };
}
/** @resource */
export interface GatewayResponse extends Resource<"AWS.ApiGateway.GatewayResponse", GatewayResponseProps, {
    restApiId: string;
    responseType: ag.GatewayResponseType;
    statusCode: string | undefined;
}, never, Providers> {
}
/**
 * Gateway response mapping for a REST API (e.g. DEFAULT_4XX, DEFAULT_5XX).
 *
 * ### Gateway responses
 * **Example:** Default 4xx JSON body
 * ```typescript
 * yield* ApiGateway.GatewayResponse("Default4xx", {
 *   restApiId: api.restApiId,
 *   responseType: "DEFAULT_4XX",
 *   responseTemplates: { "application/json": '{"message":$context.error.messageString}' },
 * });
 * ```
 */
declare const GatewayResponseResource: import("../../Resource.ts").ResourceClass<GatewayResponse>;
export { GatewayResponseResource as GatewayResponse };
export declare const GatewayResponseProvider: () => import("effect/Layer").Layer<Provider.Provider<GatewayResponse>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GatewayResponse.d.ts.map