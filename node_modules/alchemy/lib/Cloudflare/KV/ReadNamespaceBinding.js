import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeKVNamespaceBinding, makeKVNamespaceHelpers, } from "./NamespaceBinding.js";
import { ReadNamespace } from "./ReadNamespace.js";
/**
 * Implementation of the {@link ReadNamespace} binding that uses a Worker
 * binding.
 */
export const ReadNamespaceBinding = Layer.effect(ReadNamespace, Effect.suspend(() => makeKVNamespaceBinding({ makeClient: makeReadKVClient })));
/** Build the read half of the binding client. */
export const makeReadKVClient = ({ raw, use, }) => {
    return {
        raw,
        get: ((...args) => use((raw) => raw.get(...args))),
        getWithMetadata: ((...args) => use((raw) => raw.getWithMetadata(...args))),
        list: ((...args) => use((raw) => raw.list(...args))),
    };
};
//# sourceMappingURL=ReadNamespaceBinding.js.map