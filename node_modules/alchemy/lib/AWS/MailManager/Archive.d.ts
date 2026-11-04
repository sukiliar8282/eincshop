import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ArchiveProps {
    /**
     * Name of the archive. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Renames apply in place.
     */
    archiveName?: string;
    /**
     * How long archived emails are retained before automatic deletion, as a
     * Mail Manager retention enum (`THREE_MONTHS` ... `TEN_YEARS`,
     * `PERMANENT`). The wire values are calendar periods, not arbitrary
     * durations. Updates apply in place.
     * @default PERMANENT
     */
    retentionPeriod?: mm.RetentionPeriod;
    /**
     * ARN of the KMS key used to encrypt the archived emails. Immutable —
     * changing it replaces the archive.
     * @default an AWS-owned key
     */
    kmsKeyArn?: string;
    /**
     * Tags applied to the archive. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
export interface Archive extends Resource<"AWS.MailManager.Archive", ArchiveProps, {
    /** Server-assigned ID of the archive. */
    archiveId: string;
    /** ARN of the archive. */
    archiveArn: string;
    /** Name of the archive. */
    archiveName: string;
    /** Current state (ACTIVE or PENDING_DELETION). */
    archiveState: string | undefined;
}, never, Providers> {
}
/**
 * An SES Mail Manager email archive — durable storage for emails captured
 * by an `Archive` rule action, searchable and exportable for compliance.
 *
 * Deleting an archive puts it into `PENDING_DELETION` for 30 days before
 * its contents are permanently removed; the archive cannot be revived, so
 * the provider treats a pending-deletion archive as gone.
 * ### Creating Archives
 * **Example:** Compliance Archive
 * ```typescript
 * import * as MailManager from "alchemy/AWS/MailManager";
 *
 * const archive = yield* MailManager.Archive("Compliance", {
 *   retentionPeriod: "ONE_YEAR",
 * });
 *
 * const ruleSet = yield* MailManager.RuleSet("Inbound", {
 *   rules: [
 *     {
 *       Name: "ArchiveAll",
 *       Actions: [{ Archive: { TargetArchive: archive.archiveId } }],
 *     },
 *   ],
 * });
 * ```
 *
 * ### Searching the Archive at Runtime
 * **Example:** Search Archived Mail from a Lambda
 * ```typescript
 * // init — bind the search capabilities to the archive
 * const startSearch = yield* MailManager.StartArchiveSearch(archive);
 * const getSearchResults = yield* MailManager.GetArchiveSearchResults(archive);
 *
 * // runtime
 * const { SearchId } = yield* startSearch({
 *   FromTimestamp: new Date(Date.now() - 86_400_000),
 *   ToTimestamp: new Date(),
 *   MaxResults: 100,
 * });
 * ```
 *
 * @resource
 */
export declare const Archive: import("../../Resource.ts").ResourceClass<Archive>;
export declare const ArchiveProvider: () => import("effect/Layer").Layer<Provider.Provider<Archive>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Archive.d.ts.map