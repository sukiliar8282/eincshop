import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type BookmarkProps = {
    /**
     * The name of the bookmark application shown in the App Launcher. Used as
     * a stable identifier so the provider can locate the bookmark during
     * adoption / state recovery. If omitted, a unique name is generated from
     * the stack/stage/logical id.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The domain the bookmark links to, e.g. `example.com` or
     * `wiki.example.com/path`.
     */
    domain: string;
    /**
     * The image URL for the logo shown in the App Launcher dashboard.
     */
    logoUrl?: string;
    /**
     * Whether to display the bookmark in the App Launcher.
     *
     * @default true
     */
    appLauncherVisible?: boolean;
};
export type Bookmark = Resource<"Cloudflare.Access.Bookmark", BookmarkProps, {
    /** UUID of the bookmark application. */
    bookmarkId: string;
    /** Cloudflare account that owns the bookmark. */
    accountId: string;
    /** Display name reported by Cloudflare. */
    name: string;
    /** The domain the bookmark links to. */
    domain: string;
    /** The logo URL shown in the App Launcher. */
    logoUrl: string | undefined;
    /** Whether the bookmark is displayed in the App Launcher. */
    appLauncherVisible: boolean;
}, never, Providers>;
/**
 * A Cloudflare Zero Trust Access bookmark application — an unprotected link
 * shown in the App Launcher.
 * @deprecated **Legacy resource.** Cloudflare has deprecated the dedicated
 * bookmarks API in favor of Access applications with `type: "bookmark"` —
 * prefer {@link Application} for new configurations. This resource is
 * provided for managing pre-existing bookmark records.
 *
 * ### Creating a Bookmark
 * **Example:** Basic bookmark
 * ```typescript
 * const bookmark = yield* Cloudflare.Access.Bookmark("Wiki", {
 *   domain: "wiki.example.com",
 * });
 * ```
 *
 * **Example:** Bookmark with a logo, hidden from the App Launcher
 * ```typescript
 * const bookmark = yield* Cloudflare.Access.Bookmark("Wiki", {
 *   name: "internal-wiki",
 *   domain: "wiki.example.com",
 *   logoUrl: "https://example.com/logo.png",
 *   appLauncherVisible: false,
 * });
 * ```
 *
 * ### Preferred Alternative
 * **Example:** Bookmark-type Access application (non-legacy)
 * ```typescript
 * const app = yield* Cloudflare.Access.Application("Wiki", {
 *   type: "bookmark",
 *   domain: "wiki.example.com",
 * });
 * ```
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export declare const Bookmark: import("../../Resource.ts").ResourceClass<Bookmark>;
export declare const isBookmark: (value: unknown) => value is Bookmark;
export declare const BookmarkProvider: () => import("effect/Layer").Layer<Provider.Provider<Bookmark>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
//# sourceMappingURL=Bookmark.d.ts.map