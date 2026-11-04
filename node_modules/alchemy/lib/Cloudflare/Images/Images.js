import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Binding from "../Workers/Binding.js";
const TypeId = "Cloudflare.Images.Images";
export class ImagesError extends Data.TaggedError("ImagesError") {
}
export const Images = Binding.Service({
    id: TypeId,
    defaultName: "IMAGES",
    toWorkerBinding: (binding) => ({
        type: "images",
        name: binding.name,
    }),
});
export const isImages = (value) => Binding.isBinding(value) && value.kind === TypeId;
//# sourceMappingURL=Images.js.map