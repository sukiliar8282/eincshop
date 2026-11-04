import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.js";
export function onSecretRotation(secret, propsOrProcess, maybeProcess) {
    const [props, process] = typeof propsOrProcess === "function"
        ? [{}, propsOrProcess]
        : [propsOrProcess, maybeProcess];
    return RotationEventSource.use((source) => source(secret, props, process));
}
export const RotationEventSource = Binding.Service("AWS.SecretsManager.RotationEventSource");
//# sourceMappingURL=RotationEventSource.js.map