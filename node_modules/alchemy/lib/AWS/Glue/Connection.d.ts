import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export type GlueConnectionType = "JDBC" | "SFTP" | "MONGODB" | "KAFKA" | "NETWORK" | "MARKETPLACE" | "CUSTOM" | (string & {});
export interface ConnectionProps {
    /**
     * Name of the connection. If omitted, a unique name is generated. Changing
     * the name replaces the connection.
     * @default a generated physical name
     */
    connectionName?: string;
    /**
     * The type of connection. `JDBC` is the common relational case.
     */
    connectionType: GlueConnectionType;
    /**
     * A description of the connection.
     */
    description?: string;
    /**
     * Connection-type-specific properties, e.g. for `JDBC`:
     * `{ JDBC_CONNECTION_URL, USERNAME, PASSWORD }`. Secret values (e.g.
     * `PASSWORD`) should be wrapped with `Redacted.make(...)` so they are
     * kept out of logs and state output.
     */
    connectionProperties: Record<string, string | Redacted.Redacted<string>>;
    /**
     * Criteria used to match connections (for MATCH_CRITERIA lookups).
     */
    matchCriteria?: string[];
    /**
     * VPC networking requirements — required for connections that reach into a
     * VPC (e.g. JDBC to an RDS instance).
     */
    physicalConnectionRequirements?: {
        /** The subnet the connection uses. */
        subnetId?: string;
        /** Security group IDs applied to the connection's ENI. */
        securityGroupIdList?: string[];
        /** The availability zone (must match the subnet). */
        availabilityZone?: string;
    };
    /**
     * The AWS account ID of the Data Catalog. Changing it replaces the
     * connection.
     * @default the caller's account (the default Data Catalog)
     */
    catalogId?: string;
    /**
     * Tags to apply to the connection. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Connection extends Resource<"AWS.Glue.Connection", ConnectionProps, {
    /** The name of the connection. */
    connectionName: string;
    /** The ARN of the connection. */
    connectionArn: string;
    /** The connection type, e.g. `JDBC`. */
    connectionType: string;
    /** The AWS account ID of the Data Catalog the connection lives in. */
    catalogId: string;
}, {}, Providers> {
}
/**
 * An AWS Glue connection — stores the connection details (JDBC URL, VPC
 * networking, credentials) that crawlers and jobs use to reach a data store.
 * ### Creating Connections
 * **Example:** JDBC Connection
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 * import * as Redacted from "effect/Redacted";
 *
 * const connection = yield* AWS.Glue.Connection("Warehouse", {
 *   connectionType: "JDBC",
 *   connectionProperties: {
 *     JDBC_CONNECTION_URL: "jdbc:postgresql://db.example.com:5432/warehouse",
 *     USERNAME: "glue",
 *     PASSWORD: Redacted.make("secret"),
 *   },
 *   physicalConnectionRequirements: {
 *     subnetId: subnet.subnetId,
 *     securityGroupIdList: [securityGroup.groupId],
 *     availabilityZone: "us-west-2a",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Connection: import("../../Resource.ts").ResourceClass<Connection>;
export declare const ConnectionProvider: () => import("effect/Layer").Layer<Provider.Provider<Connection>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Connection.d.ts.map