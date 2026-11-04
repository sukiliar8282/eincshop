import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PlaceIndexProps {
    /**
     * Name of the place index. Immutable — changing it replaces the index.
     * @default ${app}-${stage}-${id}
     */
    indexName?: string;
    /**
     * Data provider for geocoding/search. Immutable — changing it replaces the
     * index. One of `Esri`, `Grab`, or `Here`.
     */
    dataSource: string;
    /**
     * How results of the operations that use this index will be stored.
     * `SingleUse` results can't be stored; `Storage` results can be cached.
     * @default "SingleUse"
     */
    intendedUse?: string;
    /**
     * Optional description of the place index resource.
     */
    description?: string;
    /**
     * Tags to associate with the place index.
     */
    tags?: Record<string, string>;
}
export interface PlaceIndex extends Resource<"AWS.Location.PlaceIndex", PlaceIndexProps, {
    /** Physical name of the place index. */
    indexName: string;
    /** ARN of the place index. */
    indexArn: string;
    /** Data provider backing the index. */
    dataSource: string;
    /** Intended use of the index results. */
    intendedUse: string | undefined;
    /** Description of the place index. */
    description: string | undefined;
    /** Tags currently associated with the index. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Location Service place index. A place index geocodes text and
 * positions against a chosen data provider. The data source is immutable;
 * the intended use and description can be updated in place.
 *
 * ### Creating Place Indexes
 * **Example:** Basic Place Index
 * ```typescript
 * import * as Location from "alchemy/AWS/Location";
 *
 * const index = yield* Location.PlaceIndex("Places", {
 *   dataSource: "Esri",
 * });
 * ```
 *
 * **Example:** Storage-Intent Place Index
 * ```typescript
 * const index = yield* Location.PlaceIndex("Geocoder", {
 *   dataSource: "Here",
 *   intendedUse: "Storage",
 *   description: "Cacheable geocoding index",
 * });
 * ```
 *
 * @resource
 */
export declare const PlaceIndex: import("../../Resource.ts").ResourceClass<PlaceIndex>;
export declare const PlaceIndexProvider: () => import("effect/Layer").Layer<Provider.Provider<PlaceIndex>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=PlaceIndex.d.ts.map