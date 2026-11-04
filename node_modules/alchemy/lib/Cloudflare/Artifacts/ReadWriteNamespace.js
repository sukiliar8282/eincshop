import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.js";
export const ReadWriteNamespace = Binding.Service("Cloudflare.Artifacts.ReadWriteNamespace");
export class ArtifactsError extends Data.TaggedError("ArtifactsError") {
}
export const ReadNamespace = Binding.Service("Cloudflare.Artifacts.ReadNamespace");
export const WriteNamespace = Binding.Service("Cloudflare.Artifacts.WriteNamespace");
//# sourceMappingURL=ReadWriteNamespace.js.map