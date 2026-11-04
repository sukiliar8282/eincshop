import * as Effect from "effect/Effect";
import type { AddressList } from "./AddressList.ts";
import type { Archive } from "./Archive.ts";
/**
 * Build the impl Effect for a Mail Manager operation scoped to an
 * {@link AddressList} whose request carries `AddressListId`: the deploy-time
 * half grants `actions` on the bound list's ARN, and the runtime half
 * injects the list's id into every request.
 */
export declare const makeAddressListHttpBinding: <I extends {
    AddressListId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MailManager.GetMemberOfAddressList`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the address list ARN. */
    actions: readonly string[];
}) => Effect.Effect<(list: AddressList) => Effect.Effect<(request: Omit<I, "AddressListId">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a Mail Manager import-job operation scoped to an
 * {@link AddressList} but keyed by `JobId` (the id of a job created against
 * that list): the deploy-time half grants `actions` on the bound list's ARN;
 * the runtime half passes the caller's request through unchanged.
 */
export declare const makeAddressListJobHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MailManager.StartAddressListImportJob`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the address list ARN. */
    actions: readonly string[];
}) => Effect.Effect<(list: AddressList) => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a Mail Manager operation scoped to an
 * {@link Archive} whose request carries `ArchiveId`: the deploy-time half
 * grants `actions` on the bound archive's ARN, and the runtime half injects
 * the archive's id into every request.
 */
export declare const makeArchiveHttpBinding: <I extends {
    ArchiveId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MailManager.StartArchiveSearch`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the archive ARN. */
    actions: readonly string[];
}) => Effect.Effect<(archive: Archive) => Effect.Effect<(request: Omit<I, "ArchiveId">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a Mail Manager operation scoped to an
 * {@link Archive} but keyed by a task id (`SearchId`, `ExportId`,
 * `ArchivedMessageId`): the deploy-time half grants `actions` on the bound
 * archive's ARN; the runtime half passes the caller's request through
 * unchanged.
 */
export declare const makeArchiveTaskHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MailManager.GetArchiveSearchResults`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the archive ARN. */
    actions: readonly string[];
}) => Effect.Effect<(archive: Archive) => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map