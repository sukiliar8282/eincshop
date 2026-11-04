/**
 * Shared browser-OAuth ceremony for auth providers: open the authorization
 * URL, then race the provider's local callback listener against the branded
 * "waiting for browser" prompt (spinner + compact URL; Enter switches to
 * manual code entry, `o` opens the browser again, and `c` copies the URL).
 *
 * Built-in providers (Cloudflare, Planetscale) and custom stack-provided
 * auth providers should all route their browser flows through this so the
 * login UX stays uniform.
 */
import * as Effect from "effect/Effect";
import type { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner";
import * as Interaction from "../Interaction.ts";
export interface BrowserOAuthOptions<A, E1, R1, E2, R2> {
    /** Display name, e.g. "Cloudflare" — used in the prompt title. */
    provider: string;
    /** The authorization URL the browser was pointed at. */
    url: string;
    /** Resolves when the local callback listener receives the redirect. */
    callback: Effect.Effect<A, E1, R1>;
    /** Exchanges a manually pasted code / callback URL for credentials. */
    exchange: (input: string) => Effect.Effect<A, E2, R2>;
    /** Spinner label. @default "waiting for browser authorization (up to 5 minutes)…" */
    waitingLabel?: string;
}
export declare const browserOAuth: <A, E1, R1, E2, R2>(options: BrowserOAuthOptions<A, E1, R1, E2, R2>) => Effect.Effect<A, E1 | E2 | Interaction.InteractionError, R1 | R2 | ChildProcessSpawner | Interaction.Interaction>;
//# sourceMappingURL=BrowserOAuth.d.ts.map