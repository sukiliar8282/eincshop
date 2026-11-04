import * as Data from "effect/Data";
import * as Binding from "./Binding.js";
const TypeId = "Cloudflare.RateLimit";
export class RateLimitError extends Data.TaggedError("RateLimitError") {
}
export const RateLimit = Binding.Service({
    id: TypeId,
    defaultName: "RATE_LIMIT",
    parse: (name, props) => ({
        name,
        namespaceId: String(props.namespaceId),
        simple: props.simple,
    }),
    toWorkerBinding: (binding) => ({
        type: "ratelimit",
        name: binding.name,
        namespaceId: binding.namespaceId,
        simple: binding.simple,
    }),
});
export const isRateLimit = (value) => Binding.isBinding(value) && value.kind === TypeId;
//# sourceMappingURL=RateLimit.js.map