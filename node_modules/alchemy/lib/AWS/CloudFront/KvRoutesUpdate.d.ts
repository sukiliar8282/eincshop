import type { HttpClient } from "effect/unstable/http/HttpClient";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { Credentials } from "../Credentials.ts";
export interface KvRoutesUpdateProps {
    /** ARN of the CloudFront KeyValueStore. */
    store: string;
    /** Namespace prefix. The full key is `{namespace}:{key}`. */
    namespace: string;
    /** Key within the namespace (typically "routes"). */
    key: string;
    /** The route entry string to add/manage (format: "type,namespace,hostPattern,pathPrefix"). */
    entry: string;
}
export interface KvRoutesUpdate extends Resource<"AWS.CloudFront.KvRoutesUpdate", KvRoutesUpdateProps, {
    /**
     * The ARN of the key value store holding the routes.
     */
    store: string;
    /**
     * The namespace prefix the routes were written under.
     */
    namespace: string;
    /**
     * The key the route table was written to.
     */
    key: string;
    /**
     * The serialized route table value that was written.
     */
    entry: string;
}, never, Providers> {
}
/**
 * Manages a single route entry in a JSON array stored in a CloudFront KeyValueStore.
 *
 * The routes array is stored at key `{namespace}:{key}` and supports automatic
 * chunking when the serialized array exceeds 1000 characters.
 * ### Managing Routes
 * **Example:** Add A Route Entry
 * ```typescript
 * const update = yield* KvRoutesUpdate("MyRoute", {
 *   store: store.keyValueStoreArn,
 *   namespace: "app",
 *   key: "routes",
 *   entry: "site,mysite,*,/",
 * });
 * ```
 *
 * @resource
 */
export declare const KvRoutesUpdate: import("../../Resource.ts").ResourceClass<KvRoutesUpdate>;
export declare const KvRoutesUpdateProvider: () => import("effect/Layer").Layer<Provider.Provider<KvRoutesUpdate>, never, Credentials | HttpClient>;
//# sourceMappingURL=KvRoutesUpdate.d.ts.map