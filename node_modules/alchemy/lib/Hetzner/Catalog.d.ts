import { Services } from "@distilled.cloud/hetzner";
import * as Effect from "effect/Effect";
export type CatalogKind = "location" | "serverType" | "image" | "iso" | "loadBalancerType";
declare const CatalogNotFound_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.CatalogNotFound";
} & Readonly<A>;
export declare class CatalogNotFound extends CatalogNotFound_base<{
    kind: CatalogKind;
    ref: string;
}> {
}
/**
 * Resolve a Hetzner Location by name (`nbg1`, `fsn1`, `hel1`, …) or
 * numeric id.
 */
export declare const findLocation: (ref: string | number) => Effect.Effect<Services.locations.GetLocationResponseLocation, import("@distilled.cloud/fly-io").BadGateway | import("@distilled.cloud/fly-io").BadRequest | CatalogNotFound | import("@distilled.cloud/fly-io").ConfigError | import("@distilled.cloud/fly-io").Conflict | import("@distilled.cloud/fly-io").Forbidden | import("@distilled.cloud/fly-io").GatewayTimeout | import("@distilled.cloud/hetzner").Gone | import("@distilled.cloud/hetzner").HetznerParseError | import("effect/unstable/http/HttpClientError").HttpClientError | import("@distilled.cloud/fly-io").InternalServerError | import("@distilled.cloud/fly-io").Locked | import("@distilled.cloud/hetzner").MethodNotAllowed | import("@distilled.cloud/fly-io").NotFound | import("@distilled.cloud/hetzner").PreconditionFailed | import("@distilled.cloud/fly-io").ServiceUnavailable | import("@distilled.cloud/fly-io").TooManyRequests | import("@distilled.cloud/fly-io").Unauthorized | import("@distilled.cloud/hetzner").UnknownHetznerError | import("@distilled.cloud/fly-io").UnprocessableEntity, Services.actions.HetznerOpContext>;
/**
 * Resolve a Hetzner Server Type by name (`cx22`, `cpx11`, …) or numeric id.
 */
export declare const findServerType: (ref: string | number) => Effect.Effect<Services.serverTypes.GetServerTypeResponseServerType, import("@distilled.cloud/fly-io").BadGateway | import("@distilled.cloud/fly-io").BadRequest | CatalogNotFound | import("@distilled.cloud/fly-io").ConfigError | import("@distilled.cloud/fly-io").Conflict | import("@distilled.cloud/fly-io").Forbidden | import("@distilled.cloud/fly-io").GatewayTimeout | import("@distilled.cloud/hetzner").Gone | import("@distilled.cloud/hetzner").HetznerParseError | import("effect/unstable/http/HttpClientError").HttpClientError | import("@distilled.cloud/fly-io").InternalServerError | import("@distilled.cloud/fly-io").Locked | import("@distilled.cloud/hetzner").MethodNotAllowed | import("@distilled.cloud/fly-io").NotFound | import("@distilled.cloud/hetzner").PreconditionFailed | import("@distilled.cloud/fly-io").ServiceUnavailable | import("@distilled.cloud/fly-io").TooManyRequests | import("@distilled.cloud/fly-io").Unauthorized | import("@distilled.cloud/hetzner").UnknownHetznerError | import("@distilled.cloud/fly-io").UnprocessableEntity, Services.actions.HetznerOpContext>;
/**
 * Resolve a Hetzner Image by name (`ubuntu-24.04`, …) or numeric id.
 */
export declare const findImage: (ref: string | number) => Effect.Effect<Services.images.GetImageResponseImage | undefined, import("@distilled.cloud/fly-io").BadGateway | import("@distilled.cloud/fly-io").BadRequest | CatalogNotFound | import("@distilled.cloud/fly-io").ConfigError | import("@distilled.cloud/fly-io").Conflict | import("@distilled.cloud/fly-io").Forbidden | import("@distilled.cloud/fly-io").GatewayTimeout | import("@distilled.cloud/hetzner").Gone | import("@distilled.cloud/hetzner").HetznerParseError | import("effect/unstable/http/HttpClientError").HttpClientError | import("@distilled.cloud/fly-io").InternalServerError | import("@distilled.cloud/fly-io").Locked | import("@distilled.cloud/hetzner").MethodNotAllowed | import("@distilled.cloud/fly-io").NotFound | import("@distilled.cloud/hetzner").PreconditionFailed | import("@distilled.cloud/fly-io").ServiceUnavailable | import("@distilled.cloud/fly-io").TooManyRequests | import("@distilled.cloud/fly-io").Unauthorized | import("@distilled.cloud/hetzner").UnknownHetznerError | import("@distilled.cloud/fly-io").UnprocessableEntity, Services.actions.HetznerOpContext>;
/**
 * Resolve a Hetzner ISO by name or numeric id.
 */
export declare const findIso: (ref: string | number) => Effect.Effect<Services.isos.GetIsoResponseIso, import("@distilled.cloud/fly-io").BadGateway | import("@distilled.cloud/fly-io").BadRequest | CatalogNotFound | import("@distilled.cloud/fly-io").ConfigError | import("@distilled.cloud/fly-io").Conflict | import("@distilled.cloud/fly-io").Forbidden | import("@distilled.cloud/fly-io").GatewayTimeout | import("@distilled.cloud/hetzner").Gone | import("@distilled.cloud/hetzner").HetznerParseError | import("effect/unstable/http/HttpClientError").HttpClientError | import("@distilled.cloud/fly-io").InternalServerError | import("@distilled.cloud/fly-io").Locked | import("@distilled.cloud/hetzner").MethodNotAllowed | import("@distilled.cloud/fly-io").NotFound | import("@distilled.cloud/hetzner").PreconditionFailed | import("@distilled.cloud/fly-io").ServiceUnavailable | import("@distilled.cloud/fly-io").TooManyRequests | import("@distilled.cloud/fly-io").Unauthorized | import("@distilled.cloud/hetzner").UnknownHetznerError | import("@distilled.cloud/fly-io").UnprocessableEntity, Services.actions.HetznerOpContext>;
/**
 * Resolve a Hetzner Load Balancer Type by name (`lb11`, `lb21`, …) or
 * numeric id.
 */
export declare const findLoadBalancerType: (ref: string | number) => Effect.Effect<Services.loadBalancerTypes.GetLoadBalancerTypeResponseLoadBalancerType, import("@distilled.cloud/fly-io").BadGateway | import("@distilled.cloud/fly-io").BadRequest | CatalogNotFound | import("@distilled.cloud/fly-io").ConfigError | import("@distilled.cloud/fly-io").Conflict | import("@distilled.cloud/fly-io").Forbidden | import("@distilled.cloud/fly-io").GatewayTimeout | import("@distilled.cloud/hetzner").Gone | import("@distilled.cloud/hetzner").HetznerParseError | import("effect/unstable/http/HttpClientError").HttpClientError | import("@distilled.cloud/fly-io").InternalServerError | import("@distilled.cloud/fly-io").Locked | import("@distilled.cloud/hetzner").MethodNotAllowed | import("@distilled.cloud/fly-io").NotFound | import("@distilled.cloud/hetzner").PreconditionFailed | import("@distilled.cloud/fly-io").ServiceUnavailable | import("@distilled.cloud/fly-io").TooManyRequests | import("@distilled.cloud/fly-io").Unauthorized | import("@distilled.cloud/hetzner").UnknownHetznerError | import("@distilled.cloud/fly-io").UnprocessableEntity, Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=Catalog.d.ts.map