import * as snippets from "@distilled.cloud/cloudflare/snippets";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export interface SnippetProps {
    /**
     * Zone the snippet belongs to. Stable — changing the zone triggers
     * replacement.
     */
    zoneId: string;
    /**
     * Name of the snippet. Snippet names may only contain letters, numbers,
     * and underscores (`[a-zA-Z0-9_]`) — the name is the snippet's identity
     * within the zone, so changing it triggers replacement.
     *
     * If omitted, a unique name is generated from the app, stage, and
     * logical ID.
     *
     * @default ${app}_${id}_${stage}_${suffix}
     */
    name?: string;
    /**
     * JavaScript source code of the snippet (ES module). Snippets are
     * lightweight Workers-like scripts with hard platform limits: no
     * environment variables or bindings, 5ms CPU time, 2MB memory, and a
     * 32KB compressed size limit (500KB on Enterprise).
     *
     * Mutable — updated in place via upload.
     */
    code: string;
    /**
     * Filename of the snippet's main module as referenced in the upload.
     *
     * @default "snippet.js"
     */
    mainModule?: string;
}
export interface SnippetAttributes {
    /** Name identifying the snippet within the zone. */
    name: string;
    /** Zone that owns this snippet. */
    zoneId: string;
    /** Filename of the snippet's main module. */
    mainModule: string;
    /** ISO8601 creation timestamp. */
    createdOn: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string | undefined;
}
export type Snippet = Resource<"Cloudflare.Snippets.Snippet", SnippetProps, SnippetAttributes, never, Providers>;
/**
 * A Cloudflare Snippet — a lightweight JavaScript module that runs on
 * Cloudflare's edge to modify HTTP traffic for a zone.
 *
 * Uploading a snippet does not activate it: traffic only flows through a
 * snippet once a {@link SnippetRules} rule references it with a matching
 * expression.
 *
 * Safety: snippets carry no ownership markers. When there is no prior
 * state, `read` looks the snippet up by name and reports an existing match
 * as `Unowned`, so the engine refuses to take it over unless `--adopt`
 * (or `adopt(true)`) is set.
 * ### Creating a Snippet
 * **Example:** Add a response header
 * ```typescript
 * const snippet = yield* Cloudflare.Snippets.Snippet("HeaderSnippet", {
 *   zoneId: zone.zoneId,
 *   code: `
 *     export default {
 *       async fetch(request) {
 *         const response = await fetch(request);
 *         const headers = new Headers(response.headers);
 *         headers.set("x-snippet", "hello");
 *         return new Response(response.body, { ...response, headers });
 *       },
 *     };
 *   `,
 * });
 * ```
 *
 * ### Activating with Snippet Rules
 * **Example:** Route traffic through the snippet
 * ```typescript
 * yield* Cloudflare.Snippets.SnippetRules("Rules", {
 *   zoneId: zone.zoneId,
 *   rules: [
 *     {
 *       snippetName: snippet.name,
 *       expression: 'http.request.uri.path wildcard "/api/*"',
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 * @product Snippets
 * @category Rules & Configuration
 */
export declare const Snippet: import("../../Resource.ts").ResourceClass<Snippet>;
export declare const isSnippet: (value: unknown) => value is Snippet;
export declare const SnippetProvider: () => import("effect/Layer").Layer<Provider.Provider<Snippet>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | snippets.CloudflareOpContext>;
//# sourceMappingURL=Snippet.d.ts.map