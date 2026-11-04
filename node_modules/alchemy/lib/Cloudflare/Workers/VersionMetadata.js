import * as Binding from "./Binding.js";
const TypeId = "Cloudflare.Workers.VersionMetadata";
export const VersionMetadata = Binding.Service({
    id: TypeId,
    defaultName: "CF_VERSION_METADATA",
    toWorkerBinding: (binding) => ({
        type: "version_metadata",
        name: binding.name,
    }),
});
export const isVersionMetadata = (value) => Binding.isBinding(value) && value.kind === TypeId;
//# sourceMappingURL=VersionMetadata.js.map