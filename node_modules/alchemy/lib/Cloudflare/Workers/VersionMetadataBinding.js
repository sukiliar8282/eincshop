import { makeBindingLayer } from "./BindingLayer.js";
import { VersionMetadata, } from "./VersionMetadata.js";
/**
 * The layer that provides the Effect-native interface for the Cloudflare
 * Workers Version Metadata binding.
 *
 * Provide it on the Worker effect (`Effect.provide(Cloudflare.Workers.VersionMetadataBinding)`)
 * so that yielding a {@link VersionMetadata} binding attaches the native
 * `version_metadata` binding to the surrounding Worker at deploy time and, at
 * runtime, resolves to a deferred {@link VersionMetadataAccessor} (yield it to
 * read the {@link WorkerVersionMetadata}).
 */
export const VersionMetadataBinding = makeBindingLayer(VersionMetadata, (raw) => raw);
//# sourceMappingURL=VersionMetadataBinding.js.map