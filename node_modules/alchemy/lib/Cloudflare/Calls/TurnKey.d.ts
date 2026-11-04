import * as calls from "@distilled.cloud/cloudflare/calls";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Calls.TurnKey";
type TypeId = typeof TypeId;
export type TurnKeyProps = {
    /**
     * A short description of the TURN key, not shown to end users and not
     * unique. Mutable in place. If omitted, a unique name is generated from
     * the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
};
export type TurnKeyAttributes = {
    /**
     * Cloudflare-generated unique identifier for the TURN key. Used in the
     * credential-minting API path
     * (`https://rtc.live.cloudflare.com/v1/turn/keys/{keyId}/credentials/generate`).
     */
    keyId: string;
    /**
     * The Cloudflare account the TURN key belongs to.
     */
    accountId: string;
    /**
     * TURN key secret (bearer token) used to mint short-lived TURN
     * credentials. Returned only at creation time and never re-readable —
     * Alchemy persists it in state and carries it forward across updates.
     */
    key: Redacted.Redacted<string>;
    /**
     * A short description of the TURN key.
     */
    name: string;
    /**
     * When the TURN key was created.
     */
    created: string;
    /**
     * When the TURN key was last modified.
     */
    modified: string;
};
export type TurnKey = Resource<TypeId, TurnKeyProps, TurnKeyAttributes, never, Providers>;
/**
 * A Cloudflare Realtime (formerly "Calls") TURN key.
 *
 * A TURN key authenticates your backend against Cloudflare's managed TURN
 * service: you exchange the create-only `key` (a bearer token) for
 * short-lived TURN credentials that WebRTC clients use to relay traffic
 * through Cloudflare's network. The only configurable property is the
 * human-readable `name`, which is mutable in place.
 * ### Creating a TURN key
 * **Example:** TURN key with a generated name
 * ```typescript
 * const turnKey = yield* Cloudflare.Calls.TurnKey("turn", {});
 * ```
 *
 * **Example:** TURN key with an explicit name
 * ```typescript
 * const turnKey = yield* Cloudflare.Calls.TurnKey("turn", {
 *   name: "my-turn-key",
 * });
 * ```
 *
 * ### Using the key
 * **Example:** Minting TURN credentials server-side
 * ```typescript
 * // keyId is public — it appears in the credential-minting URL:
 * const keyId = turnKey.keyId;
 *
 * // The key is redacted — POST it as a bearer token to
 * // https://rtc.live.cloudflare.com/v1/turn/keys/{keyId}/credentials/generate
 * const apiToken = turnKey.key; // Redacted<string>
 * ```
 *
 * @see https://developers.cloudflare.com/realtime/turn/
 *
 * @resource
 * @product Calls
 * @category Media
 */
export declare const TurnKey: import("../../Resource.ts").ResourceClass<TurnKey>;
/**
 * Returns true if the given value is a TurnKey resource.
 */
export declare const isTurnKey: (value: unknown) => value is TurnKey;
export declare const TurnKeyProvider: () => import("effect/Layer").Layer<Provider.Provider<TurnKey>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | calls.CloudflareOpContext>;
export {};
//# sourceMappingURL=TurnKey.d.ts.map