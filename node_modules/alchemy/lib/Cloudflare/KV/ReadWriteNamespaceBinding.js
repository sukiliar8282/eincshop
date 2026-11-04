import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeKVNamespaceBinding, } from "./NamespaceBinding.js";
import { makeReadKVClient } from "./ReadNamespaceBinding.js";
import { ReadWriteNamespace, } from "./ReadWriteNamespace.js";
import { makeWriteKVClient } from "./WriteNamespaceBinding.js";
/**
 * Implementation of the {@link ReadWriteNamespace} binding that uses a
 * Worker binding.
 */
export const ReadWriteNamespaceBinding = Layer.effect(ReadWriteNamespace, Effect.suspend(() => makeKVNamespaceBinding({ makeClient: makeReadWriteKVClient })));
/** Build the read-write binding client from its read and write halves. */
export const makeReadWriteKVClient = (helpers) => ({
    ...makeReadKVClient(helpers),
    ...makeWriteKVClient(helpers),
});
//# sourceMappingURL=ReadWriteNamespaceBinding.js.map