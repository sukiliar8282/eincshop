import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface NamedQueryProps {
    /**
     * Display name of the saved query. If omitted, a unique name is generated.
     * Up to 128 characters.
     */
    name?: string;
    /**
     * The SQL text of the saved query.
     */
    queryString: string;
    /**
     * Glue/Athena database the query runs against. Changing this replaces the
     * named query (Athena cannot re-point a saved query's database in place).
     */
    database: string;
    /**
     * Optional human-readable description.
     */
    description?: string;
    /**
     * Workgroup the query is saved in. Changing this replaces the named query.
     * @default "primary"
     */
    workGroup?: string;
}
export interface NamedQuery extends Resource<"AWS.Athena.NamedQuery", NamedQueryProps, {
    /**
     * Unique ID of the named query.
     */
    namedQueryId: string;
    /**
     * Name of the saved query.
     */
    name: string;
    /**
     * The saved SQL statement.
     */
    queryString: string;
    /**
     * Database the query runs against.
     */
    database: string;
    /**
     * Description of the query.
     */
    description: string | undefined;
    /**
     * Workgroup the query is saved in.
     */
    workGroup: string;
}, never, Providers> {
}
/**
 * An Amazon Athena named (saved) query — a reusable SQL statement stored
 * against a Glue database inside a workgroup. Its identity is the
 * server-assigned `NamedQueryId`; the `name`, `description`, and `queryString`
 * are updatable in place, while changing `database` or `workGroup` replaces it.
 *
 * ### Saving Queries
 * **Example:** Save a query against a Glue database
 * ```typescript
 * const query = yield* AWS.Athena.NamedQuery("TopCustomers", {
 *   database: "analytics",
 *   queryString: "SELECT customer_id, SUM(amount) AS total " +
 *     "FROM orders GROUP BY customer_id ORDER BY total DESC LIMIT 10",
 *   workGroup: wg.workGroupName,
 * });
 * ```
 *
 * @resource
 */
export declare const NamedQuery: import("../../Resource.ts").ResourceClass<NamedQuery>;
export declare const NamedQueryProvider: () => import("effect/Layer").Layer<Provider.Provider<NamedQuery>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=NamedQuery.d.ts.map