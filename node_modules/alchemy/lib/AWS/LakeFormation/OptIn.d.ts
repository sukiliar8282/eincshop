import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { type LakeFormationResourceSpec } from "./ResourceSpec.ts";
export interface OptInProps {
    /**
     * The principal (IAM user/role ARN or `IAM_ALLOWED_PRINCIPALS`) whose
     * access to the resource is opted into Lake Formation enforcement.
     * Changing it replaces the opt-in.
     */
    principal: string;
    /**
     * The Data Catalog resource (database, table, …) to enforce Lake
     * Formation permissions on for the principal. Changing it replaces the
     * opt-in.
     */
    resource: LakeFormationResourceSpec;
}
export interface OptIn extends Resource<"AWS.LakeFormation.OptIn", OptInProps, {
    principal: string;
    resource: lf.Resource;
}, {}, Providers> {
}
/**
 * A Lake Formation opt-in — enforces Lake Formation permissions for one
 * principal on one Data Catalog resource while the account is in hybrid
 * access mode (where IAM/S3 policies otherwise govern access).
 *
 * ### Opting Into Lake Formation Enforcement
 * **Example:** Enforce Lake Formation for a Role on a Database
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const optIn = yield* AWS.LakeFormation.OptIn("AnalystOptIn", {
 *   principal: analystRole.roleArn,
 *   resource: { database: { name: database.databaseName } },
 * });
 * ```
 *
 * @resource
 */
export declare const OptIn: import("../../Resource.ts").ResourceClass<OptIn>;
export declare const OptInProvider: () => import("effect/Layer").Layer<Provider.Provider<OptIn>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=OptIn.d.ts.map