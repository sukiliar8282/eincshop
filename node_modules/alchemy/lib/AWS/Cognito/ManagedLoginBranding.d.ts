import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * An image asset (logo, favicon, background, …) attached to a managed login
 * branding style, per color mode.
 */
export interface ManagedLoginBrandingAsset {
    /** Which slot of the managed login pages the asset fills. */
    category: "FAVICON_ICO" | "FAVICON_SVG" | "EMAIL_GRAPHIC" | "SMS_GRAPHIC" | "AUTH_APP_GRAPHIC" | "PASSWORD_GRAPHIC" | "PASSKEY_GRAPHIC" | "PAGE_HEADER_LOGO" | "PAGE_HEADER_BACKGROUND" | "PAGE_FOOTER_LOGO" | "PAGE_FOOTER_BACKGROUND" | "PAGE_BACKGROUND" | "FORM_BACKGROUND" | "FORM_LOGO" | "IDP_BUTTON_ICON";
    /** The color scheme the asset applies to. */
    colorMode: "LIGHT" | "DARK" | "DYNAMIC";
    /** The file type of the asset. */
    extension: "ICO" | "JPEG" | "PNG" | "SVG" | "WEBP";
    /** The image file, as bytes (max 2 MB). */
    bytes?: Uint8Array;
    /** For `IDP_BUTTON_ICON` assets, the identity provider the icon is for. */
    resourceId?: string;
}
export interface ManagedLoginBrandingProps {
    /**
     * The ID of the user pool the branding style belongs to. Changing this
     * triggers a replacement.
     */
    userPoolId: string;
    /**
     * The ID of the app client the branding style is assigned to. Each app
     * client can have exactly one style. Changing this triggers a
     * replacement.
     */
    clientId: string;
    /**
     * Apply Cognito's default branding instead of custom `settings` /
     * `assets`. This is what makes a fresh pool's managed login pages render
     * without a one-time console step.
     * @default true when neither `settings` nor `assets` is provided
     */
    useCognitoProvidedValues?: boolean;
    /**
     * The branding settings JSON document (colors, component styles, …) in
     * the shape produced by the managed login branding designer / returned by
     * `DescribeManagedLoginBranding`.
     */
    settings?: Record<string, unknown>;
    /**
     * Image assets for the branding style (logos, favicons, backgrounds),
     * one per category + color mode.
     */
    assets?: ManagedLoginBrandingAsset[];
}
export interface ManagedLoginBranding extends Resource<"AWS.Cognito.ManagedLoginBranding", ManagedLoginBrandingProps, {
    /** The generated ID of the branding style. */
    managedLoginBrandingId: string;
    /** The ID of the user pool the style belongs to. */
    userPoolId: string;
    /** The ID of the app client the style is assigned to. */
    clientId: string;
}, never, Providers> {
}
/**
 * A managed login branding style for an Amazon Cognito user pool app
 * client. Assigning a style (even just Cognito's provided defaults) is what
 * activates the hosted managed login pages — a `UserPoolDomain` with
 * `managedLoginVersion: 2` serves them end-to-end without any console step.
 * ### Activating Managed Login
 * **Example:** Default Branding for a Hosted Login Domain
 * ```typescript
 * import * as Cognito from "alchemy/AWS/Cognito";
 *
 * const pool = yield* Cognito.UserPool("Users", {});
 * const client = yield* Cognito.UserPoolClient("Web", {
 *   userPoolId: pool.userPoolId,
 *   callbackUrls: ["https://example.com/callback"],
 *   allowedOAuthFlowsUserPoolClient: true,
 *   allowedOAuthFlows: ["code"],
 *   allowedOAuthScopes: ["openid", "email"],
 * });
 * const domain = yield* Cognito.UserPoolDomain("AuthDomain", {
 *   userPoolId: pool.userPoolId,
 *   managedLoginVersion: 2,
 * });
 * yield* Cognito.ManagedLoginBranding("Branding", {
 *   userPoolId: pool.userPoolId,
 *   clientId: client.clientId,
 * });
 * ```
 *
 * ### Custom Branding
 * **Example:** Custom Settings and a Logo Asset
 * ```typescript
 * yield* Cognito.ManagedLoginBranding("Branding", {
 *   userPoolId: pool.userPoolId,
 *   clientId: client.clientId,
 *   settings: brandingSettings, // designer-exported JSON document
 *   assets: [{
 *     category: "FORM_LOGO",
 *     colorMode: "LIGHT",
 *     extension: "PNG",
 *     bytes: logoBytes,
 *   }],
 * });
 * ```
 *
 * @resource
 */
export declare const ManagedLoginBranding: import("../../Resource.ts").ResourceClass<ManagedLoginBranding>;
export declare const ManagedLoginBrandingProvider: () => import("effect/Layer").Layer<Provider.Provider<ManagedLoginBranding>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ManagedLoginBranding.d.ts.map