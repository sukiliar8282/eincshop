import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { Api } from "./Api.ts";
export interface ApiMappingProps {
    /**
     * ID of the API being mapped. Usually derived from `api.apiId` by the
     * {@link ApiMapping} wrapper.
     */
    apiId: string;
    /**
     * The custom domain name to map the API onto. Changing this triggers a
     * replacement.
     */
    domainName: string;
    /**
     * The stage to serve at the mapping, e.g. `$default`.
     */
    stage: string;
    /**
     * The base path under the domain, e.g. `v1` serves the API at
     * `https://{domainName}/v1`. Omit to serve at the domain root.
     */
    apiMappingKey?: string;
}
export interface ApiMapping extends Resource<"AWS.ApiGatewayV2.ApiMapping", ApiMappingProps, {
    /** The mapping identifier. */
    apiMappingId: string;
    /** The mapped API. */
    apiId: string;
    /** The custom domain name. */
    domainName: string;
    /** The mapped stage. */
    stage: string;
    /** The base path key. */
    apiMappingKey: string | undefined;
}, never, Providers> {
}
/**
 * An API Gateway v2 API mapping — serves an API stage under a custom
 * {@link DomainName}, optionally at a base path.
 * ### Mapping APIs onto a domain
 * **Example:** Map an API at the domain root
 * ```typescript
 * yield* ApiGatewayV2.ApiMapping("Root", {
 *   api,
 *   domainName: domain.domainName,
 *   stage: stage.stageName,
 * });
 * ```
 *
 * **Example:** Map a second API under /v2
 * ```typescript
 * yield* ApiGatewayV2.ApiMapping("V2", {
 *   api: apiV2,
 *   domainName: domain.domainName,
 *   stage: "$default",
 *   apiMappingKey: "v2",
 * });
 * ```
 *
 * @resource
 */
export declare const ApiMappingResource: import("../../Resource.ts").ResourceClass<ApiMapping>;
export interface ApiMappingInputProps extends Omit<{
    [K in keyof ApiMappingProps]?: Input<ApiMappingProps[K]>;
}, "apiId" | "domainName" | "stage"> {
    /**
     * The `Api` being mapped (preferred). Alternatively pass a raw `apiId`.
     */
    api?: Api;
    apiId?: Input<string>;
    domainName: Input<string>;
    stage: Input<string>;
}
/**
 * User-facing wrapper for the ApiMapping resource. Accepts `api: Api` as
 * the idiomatic way to map an API onto a domain.
 */
export declare const ApiMapping: (id: string, props: ApiMappingInputProps) => Effect.Effect<ApiMapping, never, Providers>;
export declare const ApiMappingProvider: () => import("effect/Layer").Layer<Provider.Provider<ApiMapping>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ApiMapping.d.ts.map