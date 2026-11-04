import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { type LakeFormationResourceSpec } from "./ResourceSpec.ts";
/**
 * An LF-tag value assignment. A resource holds exactly one value per tag key
 * (re-assigning overwrites the previous value).
 */
export interface LFTagAssignmentSpec {
    /**
     * Key of the LF-tag.
     */
    tagKey: string;
    /**
     * The value(s) to assign for the key (typically a single value).
     */
    tagValues: string[];
    /**
     * The catalog id (AWS account id) the LF-tag lives in.
     * @default the caller's account
     */
    catalogId?: string;
}
declare const LFTagAssociationError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "LFTagAssociationError";
} & Readonly<A>;
/**
 * Lake Formation returns per-tag failures with a 200 response — surfaced as
 * a typed error so partial failures fail the deploy.
 */
export declare class LFTagAssociationError extends LFTagAssociationError_base<{
    message: string;
    failures: lf.LFTagError[];
}> {
}
export interface LFTagAssociationProps {
    /**
     * The Data Catalog resource to tag — a database, table, or
     * tableWithColumns variant. Changing it replaces the association.
     */
    resource: LakeFormationResourceSpec;
    /**
     * The LF-tag values to assign to the resource. Keys removed from the list
     * are detached; a key's value is overwritten in place.
     */
    lfTags: LFTagAssignmentSpec[];
    /**
     * The catalog id (AWS account id).
     * @default the caller's account
     */
    catalogId?: string;
}
export interface LFTagAssociation extends Resource<"AWS.LakeFormation.LFTagAssociation", LFTagAssociationProps, {
    resource: lf.Resource;
    lfTags: {
        tagKey: string;
        tagValues: string[];
    }[];
    catalogId: string | undefined;
}, {}, Providers> {
}
/**
 * Attaches LF-tag values to a Data Catalog resource (database, table, or
 * columns) for Lake Formation tag-based access control.
 *
 * Requires the caller to be a data lake administrator (or hold `ASSOCIATE`
 * on the LF-tags) — see
 * {@link DataLakeSettings | AWS.LakeFormation.DataLakeSettings}.
 *
 * ### Tagging Resources
 * **Example:** Tag a Database
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const association = yield* AWS.LakeFormation.LFTagAssociation("DbEnvTag", {
 *   resource: { database: { name: database.databaseName } },
 *   lfTags: [{ tagKey: envTag.tagKey, tagValues: ["prod"] }],
 * });
 * ```
 *
 * **Example:** Tag a Table
 * ```typescript
 * const association = yield* AWS.LakeFormation.LFTagAssociation("TableTag", {
 *   resource: {
 *     table: { databaseName: database.databaseName, name: "events" },
 *   },
 *   lfTags: [{ tagKey: envTag.tagKey, tagValues: ["dev"] }],
 * });
 * ```
 *
 * @resource
 */
export declare const LFTagAssociation: import("../../Resource.ts").ResourceClass<LFTagAssociation>;
export declare const LFTagAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<LFTagAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=LFTagAssociation.d.ts.map