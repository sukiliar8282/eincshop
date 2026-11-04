import { Credentials, CredentialsFromEnv } from "@distilled.cloud/fly-io";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import * as Binding from "../Binding.js";
/**
 * Shared scaffolding for HTTP-backed Fly Sprite bindings.
 *
 * Captures ambient `FLY_API_TOKEN` during stack-eval (so Actions work
 * in-process) and, when the host is a {@link Sprite}, {@link Service},
 * or {@link Machine}, injects `FLY_API_TOKEN` into the host env.
 * Runtime calls inside a deployed host read that env via
 * {@link CredentialsFromEnv}. Distilled mints a Sprites bearer from it.
 *
 * NOT exported from `index.ts`.
 */
export const makeHttpSpriteBinding = (options) => Effect.gen(function* () {
    const context = yield* Effect.context();
    return Effect.fn(function* (sprite) {
        const name = yield* sprite.name;
        const nameEff = toNameEffect(name);
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isFlyHost(host)) {
                const token = yield* resolveToken(context);
                yield* host.bind `${sprite}`({
                    env: { FLY_API_TOKEN: token },
                });
            }
        }
        return options.makeClient(makeSpriteAuth(context), nameEff);
    });
});
export const makeSpriteAuth = (ambient) => ({
    authorize: (eff) => {
        if (globalThis.__ALCHEMY_RUNTIME__) {
            return eff.pipe(Effect.provide(Layer.mergeAll(CredentialsFromEnv, FetchHttpClient.layer)));
        }
        return eff.pipe(Effect.provideContext(ambient));
    },
});
const toNameEffect = (value) => {
    if (typeof value === "string")
        return Effect.succeed(value);
    if (Effect.isEffect(value)) {
        return value;
    }
    return Effect.die("Fly sprite binding expected a resolved sprite name");
};
const isFlyHost = (value) => typeof value === "object" &&
    value !== null &&
    (value.Type === "Fly.Sprite" ||
        value.Type === "Fly.Service" ||
        value.Type === "Fly.Machine");
const resolveToken = (ambient) => Credentials.pipe(Effect.provideContext(ambient), Effect.flatMap((resolve) => resolve), Effect.map((cfg) => Redacted.value(cfg.apiKey)));
//# sourceMappingURL=SpriteHttp.js.map