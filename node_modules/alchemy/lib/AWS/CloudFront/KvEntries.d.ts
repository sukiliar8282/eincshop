import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface KvEntriesProps {
    /** ARN of the CloudFront KeyValueStore. */
    store: string;
    /** Namespace prefix for all keys. Keys are stored as `{namespace}:{key}`. */
    namespace: string;
    /** Map of key → value entries to manage. */
    entries: Record<string, Input<string>>;
    /** Whether to delete keys under this namespace that are not in `entries`. @default false */
    purge?: boolean;
}
export interface KvEntries extends Resource<"AWS.CloudFront.KvEntries", KvEntriesProps, {
    /** ARN of the CloudFront KeyValueStore. */
    store: string;
    /** Namespace prefix used for keys. */
    namespace: string;
    /** Current entries managed under the namespace. */
    entries: Record<string, string>;
}, never, Providers> {
}
/**
 * Manages namespaced key-value entries in a CloudFront KeyValueStore.
 *
 * Entries are stored with a `{namespace}:{key}` prefix to allow multiple
 * logical groups within a single store. Updates use batched optimistic
 * concurrency with automatic ETag retry.
 * ### Managing Entries
 * **Example:** Basic Entries
 * ```typescript
 * const entries = yield* KvEntries("Routes", {
 *   store: store.keyValueStoreArn,
 *   namespace: "routes",
 *   entries: {
 *     "/": "/index.html",
 *     "/about": "/about.html",
 *   },
 * });
 * ```
 *
 * **Example:** Purge Stale Keys
 * ```typescript
 * const entries = yield* KvEntries("Routes", {
 *   store: store.keyValueStoreArn,
 *   namespace: "routes",
 *   entries: { "/": "/index.html" },
 *   purge: true,
 * });
 * ```
 *
 * @resource
 */
export declare const KvEntries: import("../../Resource.ts").ResourceClass<KvEntries>;
export declare const KvEntriesProvider: () => import("effect/Layer").Layer<Provider.Provider<KvEntries>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=KvEntries.d.ts.map