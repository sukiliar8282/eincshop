import * as Redacted from "effect/Redacted";
import * as Binding from "./Binding.js";
const TypeId = "Cloudflare.Workers.SecretKey";
const unwrap = (value) => value === undefined
    ? undefined
    : Redacted.isRedacted(value)
        ? Redacted.value(value)
        : value;
export const SecretKey = Binding.Service({
    id: TypeId,
    defaultName: "SECRET_KEY",
    parse: (name, props) => ({
        name,
        format: props.format,
        algorithm: props.algorithm,
        usages: [...props.usages],
        // The wire shape is plain — Redacted key material is unwrapped at bind
        // time (same convention as Redacted env values → `secret_text`).
        keyBase64: unwrap(props.keyBase64),
        keyJwk: unwrap(props.keyJwk),
    }),
    toWorkerBinding: (binding) => ({
        type: "secret_key",
        name: binding.name,
        format: binding.format,
        algorithm: binding.algorithm,
        usages: binding.usages,
        keyBase64: binding.keyBase64,
        keyJwk: binding.keyJwk,
    }),
});
export const isSecretKey = (value) => Binding.isBinding(value) && value.kind === TypeId;
//# sourceMappingURL=SecretKey.js.map