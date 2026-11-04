import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type CustomPageType = "identity_denied" | "forbidden";
export type CustomPageProps = {
    /**
     * Display name for the custom page. Used as a stable identifier so the
     * provider can locate the page during adoption / state recovery. If
     * omitted, a unique name is generated from the stack/stage/logical id.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The type of Access event the page is shown for. `identity_denied` is
     * shown when a user's identity is rejected by policy; `forbidden` is shown
     * when access is blocked outright. Changing the type replaces the page.
     */
    type: CustomPageType;
    /**
     * The custom HTML served for the page.
     */
    customHtml: string;
};
export type CustomPage = Resource<"Cloudflare.Access.CustomPage", CustomPageProps, {
    /** UUID of the custom page assigned by Cloudflare. */
    customPageId: string;
    /** Cloudflare account that owns the custom page. */
    accountId: string;
    /** Display name reported by Cloudflare. */
    name: string;
    /** The Access event type the page is shown for. */
    type: CustomPageType;
}, never, Providers>;
/**
 * A Cloudflare Zero Trust Access custom page. Replaces the default Access
 * block pages (`identity_denied` / `forbidden`) with custom HTML, which can
 * then be selected on an Access application.
 * ### Creating a Custom Page
 * **Example:** Custom forbidden page
 * ```typescript
 * const page = yield* Cloudflare.Access.CustomPage("Forbidden", {
 *   type: "forbidden",
 *   customHtml: "<html><body><h1>Access denied</h1></body></html>",
 * });
 * ```
 *
 * **Example:** Custom identity-denied page with an explicit name
 * ```typescript
 * const page = yield* Cloudflare.Access.CustomPage("Denied", {
 *   name: "corp-identity-denied",
 *   type: "identity_denied",
 *   customHtml: "<html><body><h1>Who are you?</h1></body></html>",
 * });
 * ```
 *
 * ### Updating the HTML
 * **Example:** HTML and name converge in place
 * ```typescript
 * const page = yield* Cloudflare.Access.CustomPage("Forbidden", {
 *   type: "forbidden",
 *   customHtml: "<html><body><h1>Still denied</h1></body></html>",
 * });
 * ```
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export declare const CustomPage: import("../../Resource.ts").ResourceClass<CustomPage>;
export declare const isCustomPage: (value: unknown) => value is CustomPage;
export declare const CustomPageProvider: () => import("effect/Layer").Layer<Provider.Provider<CustomPage>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
//# sourceMappingURL=CustomPage.d.ts.map