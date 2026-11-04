import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type TagProps = {
    /**
     * The name of the tag. The name IS the tag's identity on the Cloudflare
     * API (it is the path parameter for get/update/delete), so changing it
     * replaces the resource. If omitted, a unique name is generated from the
     * stack/stage/logical id.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
};
export type Tag = Resource<"Cloudflare.Access.Tag", TagProps, {
    /** The name of the tag — also its identity on the Cloudflare API. */
    name: string;
    /** Cloudflare account that owns the tag. */
    accountId: string;
}, never, Providers>;
/**
 * A Cloudflare Zero Trust Access tag. Tags are plain labels that can be
 * attached to Access applications to group and filter them.
 *
 * The tag's name is its identity — there is nothing to update in place, so
 * renaming replaces the tag.
 * ### Creating a Tag
 * **Example:** Tag with a generated name
 * ```typescript
 * const tag = yield* Cloudflare.Access.Tag("Team", {});
 * ```
 *
 * **Example:** Tag with an explicit name
 * ```typescript
 * const tag = yield* Cloudflare.Access.Tag("Team", {
 *   name: "platform-team",
 * });
 * ```
 *
 * ### Tagging an Application
 * **Example:** Reference from an Access application
 * ```typescript
 * const tag = yield* Cloudflare.Access.Tag("Team", { name: "platform-team" });
 *
 * const app = yield* Cloudflare.Access.Application("Dashboard", {
 *   type: "self_hosted",
 *   domain: "dash.example.com",
 *   tags: [tag.name],
 * });
 * ```
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export declare const Tag: import("../../Resource.ts").ResourceClass<Tag>;
export declare const isTag: (value: unknown) => value is Tag;
export declare const TagProvider: () => import("effect/Layer").Layer<Provider.Provider<Tag>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
//# sourceMappingURL=Tag.d.ts.map