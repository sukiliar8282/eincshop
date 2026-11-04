import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The zone of trust and access type an analyzer monitors.
 *
 * - `ACCOUNT` / `ORGANIZATION` — external-access analysis (the free tier):
 *   surfaces resource policies that grant access to principals outside the
 *   account or organization.
 * - `ACCOUNT_UNUSED_ACCESS` / `ORGANIZATION_UNUSED_ACCESS` — unused-access
 *   analysis (paid): surfaces unused IAM roles, users, and permissions.
 */
export type AnalyzerType = "ACCOUNT" | "ORGANIZATION" | "ACCOUNT_UNUSED_ACCESS" | "ORGANIZATION_UNUSED_ACCESS";
export interface AnalyzerProps {
    /**
     * Name of the analyzer. Must be unique within the account/Region and start
     * with a letter (`[A-Za-z][A-Za-z0-9_.-]*`, up to 255 characters). Changing
     * the name replaces the analyzer.
     * @default a generated physical name derived from the logical ID
     */
    analyzerName?: string;
    /**
     * The analyzer's zone of trust and access type. Create-only — changing the
     * type replaces the analyzer.
     * @default "ACCOUNT"
     */
    type?: AnalyzerType;
    /**
     * How long access must go unused before the analyzer reports it as an
     * unused-access finding. Accepts any duration input (e.g. `"180 days"`);
     * converted to whole days on the wire (valid range 1–365 days). Only valid
     * for `ACCOUNT_UNUSED_ACCESS` / `ORGANIZATION_UNUSED_ACCESS` analyzers.
     * Create-only — the API rejects in-place tracking-period updates, so
     * changing this replaces the analyzer (delete-first, since accounts are
     * limited to one unused-access analyzer per Region). When omitted, the
     * analyzer's existing tracking period is left unmanaged.
     * @default "90 days" (the AWS default)
     */
    unusedAccessAge?: Duration.Input;
    /**
     * Tags to apply to the analyzer. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Analyzer extends Resource<"AWS.AccessAnalyzer.Analyzer", AnalyzerProps, {
    analyzerName: string;
    analyzerArn: string;
    type: string;
    status: string;
}, {}, Providers> {
}
/**
 * An AWS IAM Access Analyzer — continuously monitors resource policies to
 * identify resources shared with an external entity (external-access
 * analyzers) or unused IAM access (unused-access analyzers).
 *
 * The `ACCOUNT` external-access analyzer is free and is the common case:
 * create one per account per Region to have Access Analyzer surface public
 * and cross-account grants as findings.
 * ### Creating an Analyzer
 * **Example:** Account External-Access Analyzer
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const analyzer = yield* AWS.AccessAnalyzer.Analyzer("AccountAnalyzer", {
 *   type: "ACCOUNT",
 * });
 * ```
 *
 * **Example:** Analyzer with Tags
 * ```typescript
 * const analyzer = yield* AWS.AccessAnalyzer.Analyzer("AccountAnalyzer", {
 *   analyzerName: "prod-external-access",
 *   type: "ACCOUNT",
 *   tags: { Environment: "prod" },
 * });
 * ```
 *
 * **Example:** Unused-Access Analyzer with a Custom Tracking Period
 * ```typescript
 * const analyzer = yield* AWS.AccessAnalyzer.Analyzer("UnusedAccess", {
 *   type: "ACCOUNT_UNUSED_ACCESS",
 *   unusedAccessAge: "180 days",
 * });
 * ```
 *
 * ### Archiving Findings
 * **Example:** Auto-archive Findings from a Trusted Account
 * ```typescript
 * const analyzer = yield* AWS.AccessAnalyzer.Analyzer("AccountAnalyzer", {});
 *
 * yield* AWS.AccessAnalyzer.ArchiveRule("TrustedAccount", {
 *   analyzerName: analyzer.analyzerName,
 *   ruleName: "trusted-account",
 *   filter: {
 *     "principal.AWS": { eq: ["123456789012"] },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Analyzer: import("../../Resource.ts").ResourceClass<Analyzer>;
export declare const AnalyzerProvider: () => import("effect/Layer").Layer<Provider.Provider<Analyzer>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Analyzer.d.ts.map