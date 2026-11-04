import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import { Worker, WorkerEnvironment } from "../Workers/Worker.js";
import { ReadSecret, SecretError } from "./ReadSecret.js";
export const ReadSecretBinding = Layer.effect(ReadSecret, Effect.gen(function* () {
    const env = yield* WorkerEnvironment;
    const host = yield* Worker;
    return Effect.fn(function* (secret) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* host.bind `${secret}`({
                bindings: [
                    {
                        type: "secrets_store_secret",
                        name: secret.LogicalId,
                        secretName: secret.secretName,
                        storeId: secret.storeId,
                    },
                ],
            });
        }
        const raw = Effect.sync(() => env[secret.LogicalId]);
        const tryPromise = (fn) => Effect.tryPromise({
            try: fn,
            catch: (error) => new SecretError({
                message: error.message ?? "Unknown error",
                cause: error,
            }),
        });
        const getEffect = raw.pipe(Effect.flatMap((raw) => tryPromise(() => raw.get().then(Redacted.make))));
        return Object.assign(getEffect, {
            raw,
            get: () => getEffect,
        });
    });
}));
//# sourceMappingURL=ReadSecretBinding.js.map