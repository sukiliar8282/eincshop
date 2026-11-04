import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AddressListProps {
    /**
     * Name of the address list. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Mail Manager has no
     * update operation for address lists, so a rename replaces the list (its
     * members are NOT carried over).
     */
    addressListName?: string;
    /**
     * Tags applied to the address list. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
export interface AddressList extends Resource<"AWS.MailManager.AddressList", AddressListProps, {
    /** Server-assigned ID of the address list. */
    addressListId: string;
    /** ARN of the address list. */
    addressListArn: string;
    /** Name of the address list. */
    addressListName: string;
}, never, Providers> {
}
/**
 * An SES Mail Manager address list — a named set of email addresses that
 * traffic policies and rule conditions can match against (allow lists,
 * block lists, routing groups).
 *
 * The list itself is create-only config (name + tags); its members are
 * data managed at runtime via the member capabilities
 * ({@link RegisterMemberToAddressList}, {@link ListMembersOfAddressList},
 * ...) or bulk import jobs.
 * ### Creating Address Lists
 * **Example:** Block List
 * ```typescript
 * import * as MailManager from "alchemy/AWS/MailManager";
 *
 * const blockList = yield* MailManager.AddressList("BlockList", {
 *   tags: { purpose: "smtp-block-list" },
 * });
 * ```
 *
 * ### Managing Members at Runtime
 * **Example:** Register and List Members from a Lambda
 * ```typescript
 * // init — bind the member capabilities to the list
 * const registerMember = yield* MailManager.RegisterMemberToAddressList(blockList);
 * const listMembers = yield* MailManager.ListMembersOfAddressList(blockList);
 *
 * // runtime
 * yield* registerMember({ Address: "spammer@example.com" });
 * const { Addresses } = yield* listMembers({});
 * ```
 *
 * @resource
 */
export declare const AddressList: import("../../Resource.ts").ResourceClass<AddressList>;
export declare const AddressListProvider: () => import("effect/Layer").Layer<Provider.Provider<AddressList>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AddressList.d.ts.map