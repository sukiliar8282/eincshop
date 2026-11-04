import * as organizations from "@distilled.cloud/aws/organizations";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
/**
 * Distilled decodes `smithy.api#sensitive` strings (`Name`, `Email`,
 * `MasterAccountEmail`) into `Redacted.Redacted<string>` at runtime.
 * Attributes and equality checks must unwrap first — comparing the wrapper
 * against a plain string is always `false` and would persist
 * `{ "__redacted__": … }` into state.
 */
export declare const unredact: (value: string | Redacted.Redacted<string> | undefined) => string | undefined;
export type OrganizationsTags = Record<string, string>;
export declare const createName: (id: string, providedName: string | undefined, maxLength: number) => Effect.Effect<string, never, import("../../InstanceId.ts").InstanceId | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export declare const toTagRecord: (tags: organizations.Tag[] | undefined) => OrganizationsTags;
export declare const collectPages: <Page extends {
    NextToken?: string;
}, Item, E, R>(fetch: (nextToken?: string) => Effect.Effect<Page, E, R>, select: (page: Page) => ReadonlyArray<Item> | undefined) => Effect.Effect<Item[], E, R>;
export declare const retryOrganizations: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
export declare const createManagedTags: (id: string, tags: Record<string, string> | undefined) => Effect.Effect<{
    "alchemy::stack": string;
    "alchemy::stage": string;
    "alchemy::id": string;
}, never, import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export declare const readResourceTags: (resourceId: string) => Effect.Effect<OrganizationsTags, organizations.ListTagsForResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export declare const updateResourceTags: (args_0: {
    id: string;
    resourceId: string;
    olds: Record<string, string> | undefined;
    news: Record<string, string> | undefined;
}) => Effect.Effect<{
    "alchemy::stack": string;
    "alchemy::stage": string;
    "alchemy::id": string;
}, organizations.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=common.d.ts.map