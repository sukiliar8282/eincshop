import * as agw2 from "@distilled.cloud/aws/apigatewayv2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface DomainNameProps {
    /**
     * The custom domain name, e.g. `api.example.com`. Changing this
     * triggers a replacement.
     */
    domainName: string;
    /**
     * Domain name configurations. Each entry references a validated ACM
     * certificate (`CertificateArn`) in the API's region and an endpoint
     * type (`REGIONAL`).
     */
    domainNameConfigurations?: agw2.DomainNameConfiguration[];
    /**
     * Mutual TLS authentication configuration (truststore S3 URI).
     */
    mutualTlsAuthentication?: agw2.MutualTlsAuthenticationInput;
    /**
     * The routing mode for the domain name.
     */
    routingMode?: agw2.RoutingMode;
    /**
     * User-defined tags (Alchemy internal tags are merged automatically).
     */
    tags?: Record<string, string>;
}
export interface DomainName extends Resource<"AWS.ApiGatewayV2.DomainName", DomainNameProps, {
    /** The custom domain name. */
    domainName: string;
    /** The domain name ARN. */
    domainNameArn: string | undefined;
    /**
     * The configurations, including the API Gateway-managed target domain
     * (`ApiGatewayDomainName`) and its Route 53 `HostedZoneId` for alias
     * records.
     */
    domainNameConfigurations: agw2.DomainNameConfiguration[] | undefined;
    mutualTlsAuthentication: agw2.MutualTlsAuthentication | undefined;
    routingMode: agw2.RoutingMode | undefined;
    apiMappingSelectionExpression: string | undefined;
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An API Gateway v2 custom domain name.
 *
 * Requires a validated ACM certificate in the same region. Point DNS
 * (a Route 53 alias or CNAME) at the returned `ApiGatewayDomainName`
 * target and map APIs onto the domain with {@link ApiMapping}.
 * ### Custom domains
 * **Example:** Regional custom domain
 * ```typescript
 * const domain = yield* ApiGatewayV2.DomainName("Domain", {
 *   domainName: "api.example.com",
 *   domainNameConfigurations: [{
 *     CertificateArn: certificate.certificateArn,
 *     EndpointType: "REGIONAL",
 *     SecurityPolicy: "TLS_1_2",
 *   }],
 * });
 *
 * yield* ApiGatewayV2.ApiMapping("Mapping", {
 *   api,
 *   domainName: domain.domainName,
 *   stage: stage.stageName,
 * });
 * ```
 *
 * @resource
 */
export declare const DomainName: import("../../Resource.ts").ResourceClass<DomainName>;
export declare const DomainNameProvider: () => import("effect/Layer").Layer<Provider.Provider<DomainName>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DomainName.d.ts.map