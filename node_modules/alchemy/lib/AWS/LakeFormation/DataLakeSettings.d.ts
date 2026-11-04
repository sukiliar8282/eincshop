import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * A principal/permissions pair used for database and table default
 * permissions.
 */
export interface DefaultPermissionSpec {
    /**
     * The principal (IAM ARN or the `IAM_ALLOWED_PRINCIPALS` group).
     */
    principal: string;
    /**
     * The permissions granted by default (e.g. `["ALL"]`).
     */
    permissions: lf.Permission[];
}
export interface DataLakeSettingsProps {
    /**
     * Principals to ensure are Lake Formation data lake administrators.
     * Managed additively: admins that already existed (or were added out of
     * band) are preserved; on destroy only the admins this resource added are
     * removed.
     */
    dataLakeAdmins?: string[];
    /**
     * Principals to ensure are read-only administrators. Managed additively,
     * like `dataLakeAdmins`.
     */
    readOnlyAdmins?: string[];
    /**
     * Default permissions applied to newly created databases. The prior value
     * is captured on first management and restored on destroy.
     */
    createDatabaseDefaultPermissions?: DefaultPermissionSpec[];
    /**
     * Default permissions applied to newly created tables. The prior value is
     * captured on first management and restored on destroy.
     */
    createTableDefaultPermissions?: DefaultPermissionSpec[];
    /**
     * Key/value parameters on the data lake settings (e.g.
     * `CROSS_ACCOUNT_VERSION`). Captured and restored like the default
     * permissions.
     */
    parameters?: Record<string, string>;
    /**
     * Account IDs whose resource shares are trusted.
     */
    trustedResourceOwners?: string[];
    /**
     * Allow external engines (EMR etc.) to filter data with Lake Formation
     * permissions.
     */
    allowExternalDataFiltering?: boolean;
    /**
     * Allow external engines full table access without session tags.
     */
    allowFullTableExternalDataAccess?: boolean;
    /**
     * Principals allowed to use external data filtering.
     */
    externalDataFilteringAllowList?: string[];
    /**
     * Session tag values authorized for external data filtering.
     */
    authorizedSessionTagValueList?: string[];
    /**
     * The catalog id (AWS account id) the settings apply to. Changing it
     * replaces the resource.
     * @default the caller's account
     */
    catalogId?: string;
}
/** Prop names whose prior values are captured and restored on destroy. */
export type ManagedField = "createDatabaseDefaultPermissions" | "createTableDefaultPermissions" | "parameters" | "trustedResourceOwners" | "allowExternalDataFiltering" | "allowFullTableExternalDataAccess" | "externalDataFilteringAllowList" | "authorizedSessionTagValueList";
export interface DataLakeSettings extends Resource<"AWS.LakeFormation.DataLakeSettings", DataLakeSettingsProps, {
    catalogId: string;
    dataLakeAdmins: string[];
    readOnlyAdmins: string[];
    managedAdmins: string[];
    managedReadOnlyAdmins: string[];
    managedFields: ManagedField[];
    captured: lf.DataLakeSettings;
}, {}, Providers> {
}
/**
 * The Lake Formation data lake settings for the account — an account/region
 * singleton controlling who the data lake administrators are, the default
 * permissions for new databases/tables, and external data filtering.
 *
 * The resource is capture-and-restore: the pre-existing settings are
 * snapshotted the first time it reconciles, admin lists are managed
 * additively (existing admins are never removed), and destroy puts back what
 * was there before for everything this resource managed.
 *
 * ### Managing Administrators
 * **Example:** Add a Data Lake Administrator
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const settings = yield* AWS.LakeFormation.DataLakeSettings("Settings", {
 *   dataLakeAdmins: [adminRole.roleArn],
 * });
 * ```
 *
 * ### Default Permissions
 * **Example:** Disable IAM-Allowed-Principals Defaults
 * ```typescript
 * const settings = yield* AWS.LakeFormation.DataLakeSettings("Settings", {
 *   dataLakeAdmins: [adminRole.roleArn],
 *   createDatabaseDefaultPermissions: [],
 *   createTableDefaultPermissions: [],
 * });
 * ```
 *
 * @resource
 */
export declare const DataLakeSettings: import("../../Resource.ts").ResourceClass<DataLakeSettings>;
export declare const DataLakeSettingsProvider: () => import("effect/Layer").Layer<Provider.Provider<DataLakeSettings>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=DataLakeSettings.d.ts.map