import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeKVNamespaceBinding, makeKVNamespaceHelpers, } from "./NamespaceBinding.js";
import { WriteNamespace } from "./WriteNamespace.js";
/**
 * Implementation of the {@link WriteNamespace} binding that uses a Worker
 * binding.
 */
export const WriteNamespaceBinding = Layer.effect(WriteNamespace, Effect.suspend(() => makeKVNamespaceBinding({ makeClient: makeWriteKVClient })));
/** Build the write half of the binding client. */
export const makeWriteKVClient = ({ use, }) => {
    return {
        put: ((...args) => use((raw) => raw.put(...args))),
        delete: ((...args) => use((raw) => raw.delete(...args))),
    };
};
//# sourceMappingURL=WriteNamespaceBinding.js.map