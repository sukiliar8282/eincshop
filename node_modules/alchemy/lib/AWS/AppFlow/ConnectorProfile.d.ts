import * as appflow from "@distilled.cloud/aws/appflow";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ConnectorProfileProps {
    /**
     * The name of the connector profile. Unique per account/region and used as
     * the profile's identity. Changing it replaces the profile.
     */
    connectorProfileName: string;
    /**
     * The type of connector (e.g. `Salesforce`, `Redshift`, `Snowflake`). S3
     * and EventBridge do not require a connector profile.
     */
    connectorType: appflow.ConnectorType;
    /**
     * The label of the custom connector, required only for the
     * `CustomConnector` type.
     */
    connectorLabel?: string;
    /**
     * Whether the connector connects over the public internet or a private
     * PrivateLink connection.
     * @default "Public"
     */
    connectionMode?: "Public" | "Private";
    /**
     * The connector-specific properties and credentials. Credentials
     * (OAuth tokens, API keys, secrets) are supplied here — these typically
     * require a human-in-the-loop authorization step with the vendor.
     */
    connectorProfileConfig: appflow.ConnectorProfileConfig;
    /**
     * The ARN of a KMS key AppFlow uses to encrypt the stored credentials.
     */
    kmsArn?: string;
}
export interface ConnectorProfile extends Resource<"AWS.AppFlow.ConnectorProfile", ConnectorProfileProps, {
    connectorProfileName: string;
    connectorProfileArn: string;
    connectorType: string | undefined;
    credentialsArn: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon AppFlow connector profile. A connector profile stores the
 * connection settings and credentials for a SaaS/data-warehouse connector
 * (Salesforce, Snowflake, Redshift, etc.) so flows can reference it.
 *
 * Most connectors require vendor credentials obtained through a
 * human-in-the-loop OAuth or API-key step, so a connector profile's live
 * lifecycle generally cannot be created purely programmatically. S3 and
 * EventBridge flows do not need a connector profile at all.
 * ### Creating a Connector Profile
 * **Example:** Redshift Connector Profile
 * ```typescript
 * const profile = yield* AppFlow.ConnectorProfile("Warehouse", {
 *   connectorProfileName: "warehouse",
 *   connectorType: "Redshift",
 *   connectionMode: "Public",
 *   connectorProfileConfig: {
 *     connectorProfileProperties: {
 *       Redshift: {
 *         databaseUrl: "jdbc:redshift://cluster:5439/db",
 *         bucketName: "appflow-staging",
 *         roleArn: role.roleArn,
 *       },
 *     },
 *     connectorProfileCredentials: {
 *       Redshift: { username: "admin", password: "..." },
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const ConnectorProfile: import("../../Resource.ts").ResourceClass<ConnectorProfile>;
export declare const ConnectorProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<ConnectorProfile>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ConnectorProfile.d.ts.map