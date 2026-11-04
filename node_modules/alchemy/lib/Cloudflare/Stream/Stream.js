import * as Data from "effect/Data";
import * as Binding from "../Workers/Binding.js";
const TypeId = "Cloudflare.Stream.Stream";
/**
 * Error produced by a {@link StreamClient} operation. Mirrors the runtime's
 * `StreamBindingError` shape (`code` is the Cloudflare Stream error code,
 * `statusCode` the HTTP status it maps to) when the failure crosses the
 * binding boundary.
 */
export class StreamError extends Data.TaggedError("StreamError") {
}
export const Stream = Binding.Service({
    id: TypeId,
    defaultName: "STREAM",
    toWorkerBinding: (binding) => ({
        type: "stream",
        name: binding.name,
    }),
});
export const isStream = (value) => Binding.isBinding(value) && value.kind === TypeId;
//# sourceMappingURL=Stream.js.map