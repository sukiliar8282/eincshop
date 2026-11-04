import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Worker, WorkerEnvironment } from "../Workers/Worker.js";
import { Send, SendEmailError, } from "./Send.js";
export const SendBinding = Layer.effect(Send, Effect.gen(function* () {
    const host = yield* Worker;
    const env = yield* WorkerEnvironment;
    return Effect.fn(function* (sender) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* host.bind(sender.name, {
                bindings: [
                    {
                        type: "send_email",
                        name: sender.name,
                        destinationAddress: sender.destinationAddress,
                        allowedDestinationAddresses: sender.allowedDestinationAddresses,
                        allowedSenderAddresses: sender.allowedSenderAddresses,
                    },
                ],
                // Dev-only local-emulation opt-out, contributed as a parallel
                // channel (like `hyperdrives`) so the wire binding stays pure.
                ...(sender.devRemote ? { devRemote: { [sender.name]: true } } : {}),
            });
        }
        const raw = Effect.sync(() => env[sender.name]);
        const tryPromise = (fn) => Effect.tryPromise({
            try: fn,
            catch: (error) => new SendEmailError({
                message: error?.message ?? "Unknown send_email error",
                cause: error,
            }),
        });
        return {
            raw,
            send: (message) => raw.pipe(Effect.flatMap((s) => tryPromise(() => s.send(message)))),
            sendRaw: (message) => raw.pipe(Effect.flatMap((s) => tryPromise(() => s.send(message)))),
        };
    });
}));
//# sourceMappingURL=SendBinding.js.map