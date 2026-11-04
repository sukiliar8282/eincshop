import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type OrganizationalUnitId = string;
export type OrganizationalUnitArn = string;
export interface OrganizationalUnitProps {
    /**
     * Parent root or OU ID.
     */
    parentId: string;
    /**
     * OU name. If omitted, Alchemy generates one.
     */
    name?: string;
    /**
     * Optional tags applied to the OU.
     */
    tags?: Record<string, string>;
}
export interface OrganizationalUnit extends Resource<"AWS.Organizations.OrganizationalUnit", OrganizationalUnitProps, {
    /**
     * ID of the OU (e.g. `ou-examplerootid-exampleouid`).
     */
    ouId: OrganizationalUnitId;
    /**
     * ARN of the OU.
     */
    ouArn: OrganizationalUnitArn;
    /**
     * Name of the OU.
     */
    name: string;
    /**
     * ID of the parent root or OU.
     */
    parentId: string | undefined;
    /**
     * Tags on the OU.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Organizations organizational unit.
 * ### Creating OUs
 * **Example:** Nested OU
 * ```typescript
 * const workloads = yield* OrganizationalUnit("Workloads", {
 *   parentId: root.rootId,
 *   name: "workloads",
 * });
 * ```
 *
 * @resource
 */
export declare const OrganizationalUnit: import("../../Resource.ts").ResourceClass<OrganizationalUnit>;
export declare const OrganizationalUnitProvider: () => import("effect/Layer").Layer<Provider.Provider<OrganizationalUnit>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=OrganizationalUnit.d.ts.map