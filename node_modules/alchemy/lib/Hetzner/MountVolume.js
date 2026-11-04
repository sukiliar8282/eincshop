import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../Binding.js";
const linuxDeviceOf = (volume) => {
    const value = volume.linuxDevice;
    return typeof value === "string" ? value : "";
};
const isBindHost = (value) => typeof value === "object" &&
    value !== null &&
    (value.Type === "Hetzner.Service" ||
        value.Type === "Hetzner.Server");
export const MountVolume = Binding.Service("Hetzner.MountVolume");
export const MountVolumeLive = Layer.effect(MountVolume, Effect.succeed(Effect.fn(function* (volume, options) {
    const device = linuxDeviceOf(volume);
    if (!globalThis.__ALCHEMY_RUNTIME__) {
        const host = yield* Binding.Host;
        if (isBindHost(host)) {
            yield* host.bind `Allow(${host}, Hetzner.MountVolume(${volume}))`({
                volumes: [{ volumeId: volume.id, path: options.path }],
            });
        }
    }
    return { path: options.path, device };
})));
//# sourceMappingURL=MountVolume.js.map