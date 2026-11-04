import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AllowListProps {
    /**
     * Custom name for the allow list (1-128 characters). Must be unique per
     * account. If omitted, a unique name is generated from the app/stage/logical
     * ID. Updatable in place.
     */
    name?: string;
    /**
     * Custom description of the allow list (up to 512 characters). Updatable in
     * place.
     */
    description?: string;
    /**
     * The criteria that specify the text to ignore — either a `regex` (a regular
     * expression that defines the text pattern) or an `s3WordsList` (an S3
     * object listing predefined words, one per line). Updatable in place.
     */
    criteria: macie2.AllowListCriteria;
    /**
     * Tags applied to the allow list. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface AllowList extends Resource<"AWS.Macie2.AllowList", AllowListProps, {
    /** Generated allow list ID. */
    id: string;
    /** ARN of the allow list. */
    arn: string;
    /** The resolved allow list name. */
    name: string;
    /** Current status code (`OK` / `S3_OBJECT_NOT_FOUND` / ...). */
    status: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon Macie allow list — text patterns or predefined words that Macie
 * ignores when it inspects S3 objects for sensitive data. Requires Macie to be
 * enabled for the account (see `Macie2.Session`). Name, description, and
 * criteria are all updatable in place; destroy deletes the list even if
 * classification jobs reference it.
 *
 * ### Creating an allow list
 * **Example:** Regex allow list
 * ```typescript
 * const allowList = yield* Macie2.AllowList("InternalIds", {
 *   description: "Internal ticket ids are not sensitive",
 *   criteria: { regex: "TICKET-[0-9]{6}" },
 * });
 * ```
 *
 * **Example:** Predefined words from S3
 * ```typescript
 * const allowList = yield* Macie2.AllowList("KnownTestData", {
 *   criteria: {
 *     s3WordsList: { bucketName: bucket.bucketName, objectKey: "words.txt" },
 *   },
 * });
 * ```
 */
declare const AllowListResource: import("../../Resource.ts").ResourceClass<AllowList>;
export { AllowListResource as AllowList };
export declare const AllowListProvider: () => import("effect/Layer").Layer<Provider.Provider<AllowList>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AllowList.d.ts.map