import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface KeyValueStoreProps {
    /**
     * KeyValueStore name. If omitted, a deterministic name is generated.
     */
    name?: string;
    /**
     * Optional store comment.
     */
    comment?: string;
}
export interface KeyValueStore extends Resource<"AWS.CloudFront.KeyValueStore", KeyValueStoreProps, {
    /**
     * KeyValueStore ID.
     */
    keyValueStoreId: string;
    /**
     * Store ARN.
     */
    keyValueStoreArn: string;
    /**
     * Store name.
     */
    keyValueStoreName: string;
    /**
     * Current comment.
     */
    comment: string;
    /**
     * Current status.
     */
    status: string;
    /**
     * Last modified time.
     */
    lastModifiedTime: Date | undefined;
    /**
     * Latest entity tag for update/delete operations.
     */
    etag: string | undefined;
}, never, Providers> {
}
/**
 * A CloudFront KeyValueStore for edge metadata.
 *
 * KeyValueStores can be associated with CloudFront Functions and are useful for
 * routing metadata or other small edge-time lookup tables.
 * ### Creating KeyValueStores
 * **Example:** Basic Store
 * ```typescript
 * const store = yield* KeyValueStore("RouterStore", {
 *   comment: "Route metadata",
 * });
 * ```
 *
 * @resource
 */
export declare const KeyValueStore: import("../../Resource.ts").ResourceClass<KeyValueStore>;
export declare const KeyValueStoreProvider: () => import("effect/Layer").Layer<Provider.Provider<KeyValueStore>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=KeyValueStore.d.ts.map