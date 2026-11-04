import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PreparedStatementProps {
    /**
     * Name of the prepared statement. If omitted, a unique name is generated.
     * Must start with a letter or underscore and contain only letters, digits,
     * and underscores. Changing this replaces the prepared statement.
     */
    statementName?: string;
    /**
     * The SQL statement text, with `?` positional parameters (e.g.
     * `SELECT * FROM t WHERE id = ?`). Updatable in place.
     */
    queryStatement: string;
    /**
     * Workgroup the statement is saved in. Changing this replaces the prepared
     * statement.
     * @default "primary"
     */
    workGroup?: string;
    /**
     * Optional human-readable description. Updatable in place.
     */
    description?: string;
}
export interface PreparedStatement extends Resource<"AWS.Athena.PreparedStatement", PreparedStatementProps, {
    /**
     * Name of the prepared statement (its identity within the workgroup).
     */
    statementName: string;
    /**
     * Workgroup the statement is saved in.
     */
    workGroup: string;
    /**
     * The SQL statement text.
     */
    queryStatement: string;
    /**
     * Description of the prepared statement.
     */
    description: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon Athena prepared statement — a named, parameterized SQL statement
 * saved in a workgroup and run with `EXECUTE name USING ...`. Identity is the
 * `(workGroup, statementName)` pair; the `queryStatement` and `description`
 * are updatable in place.
 *
 * ### Preparing Statements
 * **Example:** Save a parameterized statement in a workgroup
 * ```typescript
 * const stmt = yield* AWS.Athena.PreparedStatement("TopN", {
 *   workGroup: wg.workGroupName,
 *   queryStatement: "SELECT * FROM analytics.orders WHERE customer_id = ?",
 * });
 * // then at runtime: EXECUTE <stmt.statementName> USING 'customer-123'
 * ```
 *
 * @resource
 */
export declare const PreparedStatement: import("../../Resource.ts").ResourceClass<PreparedStatement>;
export declare const PreparedStatementProvider: () => import("effect/Layer").Layer<Provider.Provider<PreparedStatement>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=PreparedStatement.d.ts.map