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
import * as Interaction from "../Interaction.js";
import { CallbackServerStartError } from "./OAuthFlow.js";
export const browserOAuth = Effect.fn(function* (options) {
    const services = yield* Effect.context();
    // This runner is invoked later by React's keyboard event boundary, not
    // while the surrounding Effect is executing.
    const openUrl = Effect.runPromiseWith(services);
    const openFailed = yield* Interaction.openUrl(options.url).pipe(Effect.as(false), Effect.catch(() => Effect.succeed(true)));
    return yield* Effect.raceFirst(
    // A callback server that cannot start (e.g. the port is taken) must not
    // fail the race — warn and hang so manual code entry stays available.
    // Genuine OAuth failures delivered via the callback still fail fast.
    options.callback.pipe(Effect.catch((e) => e instanceof CallbackServerStartError
        ? Interaction.accessors.output
            .warning(`${e.message} — paste the authorization code instead.`)
            .pipe(Effect.andThen(Effect.never))
        : Effect.fail(e))), (yield* Interaction.Interaction).prompt
        .awaitExternal({
        message: `${options.provider} authorization`,
        waitingLabel: options.waitingLabel ??
            "waiting for browser authorization (up to 5 minutes)…",
        url: options.url,
        openFailed,
        onOpen: () => openUrl(Interaction.openUrl(options.url)),
        inputLabel: "Paste the authorization code or callback URL",
        validate: (value) => value.trim().length > 0 ? undefined : "Paste a code or URL",
    })
        .pipe(Effect.flatMap(options.exchange)));
});
//# sourceMappingURL=BrowserOAuth.js.map