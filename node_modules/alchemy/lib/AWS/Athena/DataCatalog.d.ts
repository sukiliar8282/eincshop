import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type DataCatalogArn = `arn:aws:athena:${RegionID}:${AccountID}:datacatalog/${string}`;
export interface DataCatalogProps {
    /**
     * Name of the data catalog. This is the catalog's identity — changing it
     * replaces the resource. Up to 256 characters.
     */
    name: string;
    /**
     * Catalog type. Changing this replaces the resource.
     * - `LAMBDA` — a federated connector backed by a Lambda metadata function.
     * - `GLUE` — an AWS Glue Data Catalog (typically in another account).
     * - `HIVE` — an external Apache Hive metastore via a Lambda function.
     * - `FEDERATED` — a managed federated connector.
     */
    type: "LAMBDA" | "GLUE" | "HIVE" | "FEDERATED";
    /**
     * Optional description.
     */
    description?: string;
    /**
     * Type-specific parameters. For `LAMBDA`/`HIVE` this carries the
     * `metadata-function` / `record-function` (or `function`) ARNs; for `GLUE`
     * the `catalog-id`.
     */
    parameters?: Record<string, string>;
    /**
     * User-defined tags to apply to the data catalog.
     */
    tags?: Record<string, string>;
}
export interface DataCatalog extends Resource<"AWS.Athena.DataCatalog", DataCatalogProps, {
    /**
     * Name of the data catalog.
     */
    name: string;
    /**
     * ARN of the data catalog.
     */
    dataCatalogArn: DataCatalogArn;
    /**
     * Catalog type (`LAMBDA`, `GLUE`, or `HIVE`).
     */
    type: string;
    /**
     * Type-specific connection parameters.
     */
    parameters: Record<string, string>;
    /**
     * Description of the data catalog.
     */
    description: string | undefined;
    /**
     * Tags on the data catalog.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Athena data catalog — registers an external metadata source (a
 * federated Lambda connector, an external Hive metastore, or a cross-account
 * Glue Data Catalog) that Athena queries can reference as a `catalog`.
 *
 * ### Registering Catalogs
 * **Example:** A federated Lambda-backed catalog
 * ```typescript
 * const catalog = yield* AWS.Athena.DataCatalog("Cmdb", {
 *   name: "cmdb_connector",
 *   type: "LAMBDA",
 *   parameters: {
 *     "metadata-function": connector.functionArn,
 *     "record-function": connector.functionArn,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const DataCatalog: import("../../Resource.ts").ResourceClass<DataCatalog>;
export declare const DataCatalogProvider: () => import("effect/Layer").Layer<Provider.Provider<DataCatalog>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DataCatalog.d.ts.map