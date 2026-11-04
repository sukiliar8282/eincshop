import * as aisearch from "@distilled.cloud/cloudflare/aisearch";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.AI.SearchToken";
type TypeId = typeof TypeId;
export type SearchTokenProps = {
    /**
     * Display name for the service token. Mutable in place.
     * If omitted, a unique name is generated from the app, stage, and
     * logical ID.
     * @default ${app}-${id}-${stage}-${suffix}
     */
    name?: string;
    /**
     * Id of the underlying Cloudflare API token AI Search authenticates
     * with when syncing the data source. The token must carry the
     * "AI Search Index Engine" permission group — Cloudflare validates it
     * on create/update and rejects tokens without it.
     */
    cfApiId: string;
    /**
     * Plaintext value of the underlying Cloudflare API token. Write-only —
     * Cloudflare never returns it, so rotation is detected against the
     * previously-persisted props rather than observed cloud state.
     */
    cfApiKey: Redacted.Redacted<string>;
    /**
     * Whether this is a legacy (account-level instance) token.
     * @default false
     */
    legacy?: boolean;
};
export type TokenAttributes = {
    /**
     * AI Search service token id (a UUID). Stable across updates.
     */
    id: string;
    /**
     * The Cloudflare account the token belongs to.
     */
    accountId: string;
    /**
     * Display name of the service token.
     */
    name: string;
    /**
     * Id of the underlying Cloudflare API token.
     */
    cfApiId: string;
    /**
     * Whether the token is enabled.
     */
    enabled: boolean | undefined;
    /**
     * Whether this is a legacy (account-level instance) token.
     */
    legacy: boolean | undefined;
    /**
     * When the token was created.
     */
    createdAt: string | undefined;
    /**
     * When the token was last modified.
     */
    modifiedAt: string | undefined;
    /**
     * Who created the token.
     */
    createdBy: string | undefined;
    /**
     * Who last modified the token.
     */
    modifiedBy: string | undefined;
};
export type SearchToken = Resource<TypeId, SearchTokenProps, TokenAttributes, never, Providers>;
/**
 * A Cloudflare.AI. Search service token — the credential AI Search uses to
 * access your data source (R2 bucket, Vectorize index, Workers AI) when
 * indexing.
 *
 * The token wraps an existing Cloudflare API token (`cfApiId` +
 * `cfApiKey`). That API token must carry the "AI Search Index Engine"
 * permission group — Cloudflare validates the credential on create and
 * update and rejects tokens without it. Pair it with
 * `Cloudflare.ApiToken.AccountApiToken` to mint the underlying API token in the
 * same stack, then reference the service token's `id` from an AI Search
 * instance's `tokenId` prop.
 * ### Creating a Token
 * **Example:** Minting the underlying API token in the same stack
 * ```typescript
 * const apiToken = yield* Cloudflare.ApiToken.AccountApiToken("SearchTokenSource", {
 *   policies: [
 *     {
 *       effect: "allow",
 *       permissionGroups: ["AI Search Index Engine"],
 *       resources: { [`com.cloudflare.api.account.${accountId}`]: "*" },
 *     },
 *   ],
 * });
 * const token = yield* Cloudflare.AI.SearchToken("SearchToken", {
 *   cfApiId: apiToken.tokenId,
 *   cfApiKey: apiToken.value,
 * });
 * ```
 *
 * ### Using the Token from a SearchInstance
 * **Example:** Wiring the token into an AI Search instance
 * ```typescript
 * const search = yield* Cloudflare.AI.Search("Search", {
 *   source: bucket,
 *   tokenId: token.id,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ai-search/
 *
 * @resource
 * @product AI Search
 * @category AI
 */
export declare const SearchToken: import("../../Resource.ts").ResourceClass<SearchToken>;
/**
 * Returns true if the given value is a SearchToken resource.
 */
export declare const isSearchToken: (value: unknown) => value is SearchToken;
export declare const SearchTokenProvider: () => import("effect/Layer").Layer<Provider.Provider<SearchToken>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | aisearch.CloudflareOpContext>;
export {};
//# sourceMappingURL=SearchToken.d.ts.map