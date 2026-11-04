import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface KxDatabaseProps {
    /**
     * Identifier of the kdb environment the database lives in. Changing it
     * replaces the database.
     */
    environmentId: string;
    /**
     * Name of the kdb database. Changing it replaces the database.
     * @default ${app}-${id}-${stage}-${suffix}
     */
    databaseName?: string;
    /**
     * A description of the database.
     */
    description?: string;
    /**
     * Tags to associate with the database.
     */
    tags?: Record<string, string>;
}
export interface KxDatabase extends Resource<"AWS.FinSpace.KxDatabase", KxDatabaseProps, {
    /**
     * Identifier of the kdb environment the database lives in.
     */
    environmentId: string;
    /**
     * The database's name.
     */
    databaseName: string;
    /**
     * ARN of the database.
     */
    databaseArn: string;
    /**
     * The database's description.
     */
    description: string | undefined;
    /**
     * Current tags reported for the database.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A kdb database inside an Amazon FinSpace Managed kdb environment — the
 * versioned, changeset-based store that kdb clusters mount and query.
 *
 * ### Creating kdb Databases
 * **Example:** Basic kdb Database
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const env = yield* AWS.FinSpace.KxEnvironment("Kdb", { kmsKeyId });
 * const db = yield* AWS.FinSpace.KxDatabase("Ticks", {
 *   environmentId: env.environmentId,
 *   description: "tick data",
 * });
 * ```
 *
 * @resource
 */
export declare const KxDatabase: import("../../Resource.ts").ResourceClass<KxDatabase>;
export declare const KxDatabaseProvider: () => import("effect/Layer").Layer<Provider.Provider<KxDatabase>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=KxDatabase.d.ts.map