import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * What a Location API key is allowed to call. Keys authorize *unsigned*
 * requests, so restrictions should be as narrow as possible.
 */
export interface ApiKeyRestrictions {
    /**
     * Allowed API actions, e.g. `["geo:GetMap*"]` or
     * `["geo:SearchPlaceIndexForText"]`. Wildcards are allowed at the end of
     * an action name.
     */
    allowActions: string[];
    /**
     * Allowed resource ARNs, e.g. a specific map's ARN or a wildcard like
     * `arn:aws:geo:*:*:map/*`.
     */
    allowResources: string[];
    /**
     * Optional HTTP referer patterns the key may be used from, e.g.
     * `["https://example.com/*"]`.
     */
    allowReferers?: string[];
}
export interface ApiKeyProps {
    /**
     * Name of the API key. Immutable — changing it replaces the key.
     * @default ${app}-${stage}-${id}
     */
    keyName?: string;
    /**
     * The actions, resources, and referers the key is allowed to be used
     * with. Updatable in place.
     */
    restrictions: ApiKeyRestrictions;
    /**
     * Optional description of the API key.
     */
    description?: string;
    /**
     * Expiry as an ISO-8601 timestamp, e.g. `"2027-01-01T00:00:00Z"`.
     * Mutually exclusive with `noExpiry`.
     */
    expireTime?: string;
    /**
     * Create the key without an expiry.
     * @default true when `expireTime` is omitted
     */
    noExpiry?: boolean;
    /**
     * Tags to associate with the API key.
     */
    tags?: Record<string, string>;
}
export interface ApiKey extends Resource<"AWS.Location.ApiKey", ApiKeyProps, {
    /** Physical name of the API key. */
    keyName: string;
    /** ARN of the API key resource. */
    keyArn: string;
    /**
     * The key value clients send (`v1.public.…`). Wrapped in `Redacted` —
     * unwrap with `Redacted.value(apiKey.key)` where the raw value is
     * needed.
     */
    key: Redacted.Redacted<string>;
    /** Restrictions currently applied to the key. */
    restrictions: ApiKeyRestrictions;
    /** Expiry timestamp (ISO-8601), if any. */
    expireTime: string | undefined;
    /** Description of the API key. */
    description: string | undefined;
    /** Tags currently associated with the key. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Location Service API key. API keys authorize **unsigned**
 * requests (e.g. map tiles rendered directly in a browser) to a restricted
 * set of Location actions and resources. The key name is immutable;
 * restrictions, description, and expiry can be updated in place.
 *
 * The `key` attribute is the secret key value (`v1.public.…`) clients pass
 * as the `key` query parameter; it is wrapped in `Redacted`.
 *
 * Availability: Amazon Location classic (V1) is closed to newer AWS
 * accounts — `geo:CreateKey` is rejected service-side with an
 * `AccessDeniedException` regardless of IAM policy. Accounts onboarded to
 * Location before the V2 split can create keys normally.
 *
 * ### Creating API Keys
 * **Example:** Map-Rendering Key for Browsers
 * ```typescript
 * import * as Location from "alchemy/AWS/Location";
 *
 * const map = yield* Location.Map("SiteMap", {
 *   configuration: { style: "VectorEsriStreets" },
 * });
 *
 * const key = yield* Location.ApiKey("SiteMapKey", {
 *   restrictions: {
 *     allowActions: ["geo:GetMap*"],
 *     allowResources: [map.mapArn],
 *   },
 * });
 * // Redacted.value(key.key) → "v1.public.…" — append as ?key=… to tile URLs
 * ```
 *
 * **Example:** Key with Referer Restrictions and Expiry
 * ```typescript
 * const key = yield* Location.ApiKey("WebKey", {
 *   restrictions: {
 *     allowActions: ["geo:GetMap*"],
 *     allowResources: ["arn:aws:geo:*:*:map/*"],
 *     allowReferers: ["https://example.com/*"],
 *   },
 *   expireTime: "2027-01-01T00:00:00Z",
 * });
 * ```
 *
 * @resource
 */
export declare const ApiKey: import("../../Resource.ts").ResourceClass<ApiKey>;
export declare const ApiKeyProvider: () => import("effect/Layer").Layer<Provider.Provider<ApiKey>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ApiKey.d.ts.map