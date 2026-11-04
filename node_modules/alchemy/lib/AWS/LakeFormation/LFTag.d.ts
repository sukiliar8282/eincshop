import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface LFTagProps {
    /**
     * Key of the LF-tag (unique within the catalog). Changing it replaces the
     * tag.
     */
    tagKey: string;
    /**
     * The list of possible values for the tag. Values are added/removed in
     * place via `UpdateLFTag`; a value that is attached to a resource cannot
     * be removed until it is detached.
     */
    tagValues: string[];
    /**
     * The catalog id (AWS account id) the tag lives in. Changing it replaces
     * the tag.
     * @default the caller's account
     */
    catalogId?: string;
}
export interface LFTag extends Resource<"AWS.LakeFormation.LFTag", LFTagProps, {
    tagKey: string;
    tagValues: string[];
    catalogId: string;
}, {}, Providers> {
}
/**
 * A Lake Formation LF-tag definition — a key with a list of allowed values
 * used for tag-based access control (attach values to databases/tables with
 * {@link LFTagAssociation | AWS.LakeFormation.LFTagAssociation}, grant on
 * expressions with {@link Permissions | AWS.LakeFormation.Permissions}).
 *
 * Creating LF-tags requires the caller to be a data lake administrator — see
 * {@link DataLakeSettings | AWS.LakeFormation.DataLakeSettings}.
 *
 * ### Creating LF-Tags
 * **Example:** Environment Tag
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const envTag = yield* AWS.LakeFormation.LFTag("EnvTag", {
 *   tagKey: "environment",
 *   tagValues: ["dev", "staging", "prod"],
 * });
 * ```
 *
 * @resource
 */
export declare const LFTag: import("../../Resource.ts").ResourceClass<LFTag>;
export declare const LFTagProvider: () => import("effect/Layer").Layer<Provider.Provider<LFTag>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=LFTag.d.ts.map