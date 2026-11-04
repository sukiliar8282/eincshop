import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface BasePathMappingProps {
    /** The custom domain name to map (e.g. `api.example.com`). */
    domainName: string;
    /** Domain name ID, required for private custom domain names. */
    domainNameId?: string;
    /**
     * Base path segment; omit or empty string for root mapping (`(none)` in API Gateway).
     */
    basePath?: string;
    /** ID of the REST API the path maps to. */
    restApiId: Input<string>;
    /** Name of the API stage requests are routed to. */
    stage?: string;
}
/** @resource */
export interface BasePathMapping extends Resource<"AWS.ApiGateway.BasePathMapping", BasePathMappingProps, {
    domainName: string;
    domainNameId: string | undefined;
    basePath: string;
    restApiId: string;
    stage: string | undefined;
}, never, Providers> {
}
/**
 * Maps a custom domain name path to a REST API stage.
 *
 * ### Custom domain
 * **Example:** Root mapping
 * ```typescript
 * yield* ApiGateway.BasePathMapping("Root", {
 *   domainName: domain.domainName,
 *   restApiId: api.restApiId,
 *   stage: stage.stageName,
 * });
 * ```
 */
declare const BasePathMappingResource: import("../../Resource.ts").ResourceClass<BasePathMapping>;
export { BasePathMappingResource as BasePathMapping };
export declare const BasePathMappingProvider: () => import("effect/Layer").Layer<Provider.Provider<BasePathMapping>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=BasePathMapping.d.ts.map