import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeHttpKVNamespaceBinding, makeKVAuth, } from "./NamespaceHttp.js";
import { makeReadKVHttpClient } from "./ReadNamespaceHttp.js";
import { ReadWriteNamespace, } from "./ReadWriteNamespace.js";
import { makeWriteKVHttpClient } from "./WriteNamespaceHttp.js";
/**
 * HTTP-backed implementation of the {@link ReadWriteNamespace} binding.
 *
 * It creates a scoped {@link AccountApiToken} with the `Workers KV Storage
 * Read` and `Workers KV Storage Write` permissions.
 */
export const ReadWriteNamespaceHttp = Layer.effect(ReadWriteNamespace, Effect.suspend(() => makeHttpKVNamespaceBinding({
    permissionGroups: ["Workers KV Storage Read", "Workers KV Storage Write"],
    makeClient: (token, namespaceId) => makeReadWriteKVHttpClient(makeKVAuth(token), namespaceId),
})));
/** Build the HTTP-backed read-write client over an auth + namespace. */
export const makeReadWriteKVHttpClient = (auth, namespaceId) => ({
    ...makeReadKVHttpClient(auth, namespaceId),
    ...makeWriteKVHttpClient(auth, namespaceId),
});
//# sourceMappingURL=ReadWriteNamespaceHttp.js.map