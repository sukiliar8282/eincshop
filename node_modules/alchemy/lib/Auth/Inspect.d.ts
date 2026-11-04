import * as Effect from "effect/Effect";
import { type AuthError, type ProviderDetailLine } from "./AuthProvider.ts";
import type { ProviderConfig } from "./Profile.ts";
/**
 * What a connected provider looks like right now. Establishing this means
 * decoding the stored config and asking the provider to describe itself,
 * either of which can fail — which is the point: a profile listing has to
 * show a broken connection rather than fail because of one.
 */
export interface ProviderConnection {
    readonly name: string;
    /** How credentials were supplied (`oauth`, `api-token`, …). */
    readonly method: string;
    readonly status: "connected" | "needs-reauth" | "needs-reconfigure" | "invalid" | "unavailable";
    readonly details: ReadonlyArray<ProviderDetailLine>;
    /** Present whenever `status` is anything but `connected`. */
    readonly diagnostic?: {
        readonly severity: "warning" | "error";
        readonly code: string;
        readonly message: string;
    };
}
/**
 * Resolve one stored provider's live connection status. Never fails: every
 * way this can go wrong is reported as a `status` + `diagnostic` so a listing
 * can show the whole profile.
 */
export declare const inspectProvider: (profile: string, name: string, config: ProviderConfig, registered: {
    [providerName: string]: import("./AuthProvider.ts").AuthProvider<{
        method: string;
    }, unknown>;
}, updateConfig?: ((config: ProviderConfig) => Effect.Effect<void, AuthError>) | undefined) => Effect.Effect<ProviderConnection, never, import("../Interaction.ts").Interaction>;
//# sourceMappingURL=Inspect.d.ts.map