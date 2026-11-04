import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { AppSyncDomainName } from "./DomainName.ts";
import type { GraphqlApi } from "./GraphqlApi.ts";
export interface ApiAssociationProps {
    /**
     * The custom domain name to associate. Changing it triggers a
     * replacement.
     */
    domainName: string;
    /**
     * ID of the GraphQL API served at the domain. Changing it triggers a
     * replacement (a domain serves exactly one API).
     */
    apiId: string;
}
export interface AppSyncApiAssociation extends Resource<"AWS.AppSync.ApiAssociation", ApiAssociationProps, {
    /** The associated domain name. */
    domainName: string;
    /** The associated API. */
    apiId: string;
}, never, Providers> {
}
/**
 * Associates a GraphQL API with a custom {@link DomainName}
 * (existence-only resource — a domain serves exactly one API).
 * ### Associating an API
 * **Example:** Serve an API at a custom domain
 * ```typescript
 * yield* AppSync.ApiAssociation("Assoc", { domain, api });
 * ```
 *
 * @resource
 */
export declare const ApiAssociationResource: import("../../Resource.ts").ResourceClass<AppSyncApiAssociation>;
export interface ApiAssociationInputProps {
    /** The `DomainName` resource (preferred). Alternatively pass `domainName`. */
    domain?: AppSyncDomainName;
    domainName?: Input<string>;
    /** The `GraphqlApi` resource (preferred). Alternatively pass `apiId`. */
    api?: GraphqlApi;
    apiId?: Input<string>;
}
/**
 * User-facing wrapper for the ApiAssociation resource. Accepts the
 * `DomainName` and `GraphqlApi` resources directly.
 */
export declare const ApiAssociation: (id: string, props: ApiAssociationInputProps) => Effect.Effect<AppSyncApiAssociation, never, Providers>;
export declare const ApiAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<AppSyncApiAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ApiAssociation.d.ts.map