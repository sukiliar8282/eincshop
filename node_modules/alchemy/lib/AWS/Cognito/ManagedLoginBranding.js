import * as cip from "@distilled.cloud/aws/cognito-identity-provider";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
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
export const ManagedLoginBranding = Resource("AWS.Cognito.ManagedLoginBranding");
const toWireAssets = (assets) => assets?.map((asset) => ({
    Category: asset.category,
    ColorMode: asset.colorMode,
    Extension: asset.extension,
    Bytes: asset.bytes,
    ResourceId: asset.resourceId,
}));
/** Canonicalize an asset list for order-insensitive comparison; bytes are
 * folded to base64. */
const canonicalAssets = (assets) => (assets ?? [])
    .map((asset) => [
    asset.Category,
    asset.ColorMode,
    asset.Extension,
    asset.ResourceId ?? "",
    asset.Bytes === undefined
        ? ""
        : Buffer.from(asset.Bytes).toString("base64"),
].join(":"))
    .sort()
    .join(",");
/**
 * Whether the style should carry Cognito's provided default values: an
 * explicit prop wins, otherwise defaults to `true` exactly when no custom
 * settings/assets are declared.
 */
const desiredUseProvidedValues = (news) => news.useCognitoProvidedValues ??
    (news.settings === undefined && news.assets === undefined);
/**
 * Bounded retry over the concurrent-modification window (branding updates
 * can race domain/pool operations). Explicitly typed so the conditional
 * `Retry.Return` type never leaks into declaration emit.
 */
const retryWhileConcurrent = (self) => Effect.retry(self, {
    while: (e) => e._tag === "ConcurrentModificationException",
    schedule: Schedule.max([Schedule.fixed("2 seconds"), Schedule.recurs(10)]),
});
export const ManagedLoginBrandingProvider = () => Provider.effect(ManagedLoginBranding, Effect.gen(function* () {
    const describeById = Effect.fn(function* (userPoolId, managedLoginBrandingId) {
        return yield* cip
            .describeManagedLoginBranding({
            UserPoolId: userPoolId,
            ManagedLoginBrandingId: managedLoginBrandingId,
        })
            .pipe(Effect.map((r) => r.ManagedLoginBranding), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const describeByClient = Effect.fn(function* (userPoolId, clientId) {
        return yield* cip
            .describeManagedLoginBrandingByClient({
            UserPoolId: userPoolId,
            ClientId: clientId,
        })
            .pipe(Effect.map((r) => r.ManagedLoginBranding), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return ManagedLoginBranding.Provider.of({
        stables: ["managedLoginBrandingId", "userPoolId", "clientId"],
        // Sub-resource keyed entirely by its user pool (userPoolId) with no
        // global enumeration API of its own — nuke reaches it through the
        // parent's deletion, so enumeration returns empty per the
        // ProviderService doctrine.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ olds, output }) {
            const userPoolId = output?.userPoolId ?? olds?.userPoolId;
            const clientId = output?.clientId ?? olds?.clientId;
            if (userPoolId === undefined)
                return undefined;
            const observed = output?.managedLoginBrandingId !== undefined
                ? yield* describeById(userPoolId, output.managedLoginBrandingId)
                : clientId !== undefined
                    ? yield* describeByClient(userPoolId, clientId)
                    : undefined;
            if (observed?.ManagedLoginBrandingId === undefined)
                return undefined;
            return {
                managedLoginBrandingId: observed.ManagedLoginBrandingId,
                userPoolId,
                clientId: clientId,
            };
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (olds?.userPoolId !== news?.userPoolId ||
                olds?.clientId !== news?.clientId) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ news, output, session }) {
            const { userPoolId, clientId } = news;
            const useProvided = desiredUseProvidedValues(news);
            // 1. OBSERVE — output.managedLoginBrandingId is only a cache;
            //    fall back to the by-client lookup so state loss converges.
            let observed = output?.managedLoginBrandingId !== undefined
                ? yield* describeById(userPoolId, output.managedLoginBrandingId)
                : undefined;
            if (observed === undefined) {
                observed = yield* describeByClient(userPoolId, clientId);
            }
            // 2. ENSURE — create when missing; a branding created out-of-band
            //    (or by a concurrent run) for the same client surfaces as
            //    ManagedLoginBrandingExistsException and is taken over.
            if (observed === undefined) {
                observed = yield* cip
                    .createManagedLoginBranding({
                    UserPoolId: userPoolId,
                    ClientId: clientId,
                    UseCognitoProvidedValues: useProvided,
                    Settings: news.settings,
                    Assets: toWireAssets(news.assets),
                })
                    .pipe(Effect.map((r) => r.ManagedLoginBranding), Effect.catchTag("ManagedLoginBrandingExistsException", () => describeByClient(userPoolId, clientId)));
            }
            const managedLoginBrandingId = observed?.ManagedLoginBrandingId;
            // 3. SYNC — diff observed style against desired; skip the update
            //    entirely on no-op.
            const drift = (observed?.UseCognitoProvidedValues ?? false) !== useProvided ||
                (news.settings !== undefined &&
                    JSON.stringify(news.settings) !==
                        JSON.stringify(observed?.Settings)) ||
                (news.assets !== undefined &&
                    canonicalAssets(toWireAssets(news.assets)) !==
                        canonicalAssets(observed?.Assets));
            if (drift) {
                yield* cip
                    .updateManagedLoginBranding({
                    UserPoolId: userPoolId,
                    ManagedLoginBrandingId: managedLoginBrandingId,
                    UseCognitoProvidedValues: useProvided,
                    Settings: news.settings,
                    Assets: toWireAssets(news.assets),
                })
                    .pipe(retryWhileConcurrent);
            }
            yield* session.note(managedLoginBrandingId);
            return { managedLoginBrandingId, userPoolId, clientId };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* cip
                .deleteManagedLoginBranding({
                UserPoolId: output.userPoolId,
                ManagedLoginBrandingId: output.managedLoginBrandingId,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), retryWhileConcurrent);
        }),
    });
}));
//# sourceMappingURL=ManagedLoginBranding.js.map