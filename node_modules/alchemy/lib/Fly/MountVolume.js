import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../Binding.js";
const isBindHost = (value) => typeof value === "object" &&
    value !== null &&
    (value.Type === "Fly.Service" ||
        value.Type === "Fly.Machine");
export const MountVolume = Binding.Service("Fly.MountVolume");
export const MountVolumeLive = Layer.effect(MountVolume, Effect.succeed(Effect.fn(function* (options) {
    if (!globalThis.__ALCHEMY_RUNTIME__) {
        const host = yield* Binding.Host;
        if (isBindHost(host)) {
            yield* host.bind `Fly.MountVolume(${options.path})`({
                mounts: [options],
            });
        }
    }
    return { path: options.path };
})));
//# sourceMappingURL=MountVolume.js.map