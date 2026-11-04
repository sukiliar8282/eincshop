import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface CustomDataIdentifierProps {
    /**
     * Custom name for the identifier (1-128 characters). Must be unique per
     * account. If omitted, a unique name is generated from the app/stage/logical
     * ID. Changing this replaces the identifier — custom data identifiers are
     * immutable once created.
     */
    name?: string;
    /**
     * Custom description of the identifier (up to 512 characters). Changing this
     * replaces the identifier.
     */
    description?: string;
    /**
     * The regular expression that defines the text pattern to match (up to 512
     * characters). Changing this replaces the identifier.
     */
    regex: string;
    /**
     * Words that must be in proximity of a pattern match for Macie to report it
     * (up to 50 keywords, each 3-90 UTF-8 characters). Changing this replaces
     * the identifier.
     */
    keywords?: string[];
    /**
     * Words to exclude from the results — a match containing one of these is
     * ignored (up to 10 entries, each 4-90 UTF-8 characters). Changing this
     * replaces the identifier.
     */
    ignoreWords?: string[];
    /**
     * The maximum number of characters between the end of a keyword and the end
     * of the matched text (1-300). Changing this replaces the identifier.
     * @default 50
     */
    maximumMatchDistance?: number;
    /**
     * Severity to assign findings based on the number of occurrences of matched
     * text. Changing this replaces the identifier.
     */
    severityLevels?: macie2.SeverityLevel[];
    /**
     * Tags applied to the identifier. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface CustomDataIdentifier extends Resource<"AWS.Macie2.CustomDataIdentifier", CustomDataIdentifierProps, {
    /** Generated custom data identifier ID. */
    id: string;
    /** ARN of the custom data identifier. */
    arn: string;
    /** The resolved identifier name. */
    name: string;
}, never, Providers> {
}
/**
 * An Amazon Macie custom data identifier — a regex-based detection criterion
 * (with optional keywords, ignore words, and severity thresholds) that
 * classification jobs and automated discovery use to detect organization-
 * specific sensitive data. Requires Macie to be enabled for the account (see
 * `Macie2.Session`). Definitions are immutable: any change other than tags
 * replaces the identifier. Destroy soft-deletes it.
 *
 * ### Creating a custom data identifier
 * **Example:** Employee-id detector
 * ```typescript
 * const identifier = yield* Macie2.CustomDataIdentifier("EmployeeId", {
 *   regex: "EMP-[0-9]{8}",
 *   description: "Internal employee id format",
 * });
 * ```
 *
 * **Example:** Keyword-scoped detector with severity thresholds
 * ```typescript
 * const identifier = yield* Macie2.CustomDataIdentifier("AccountNumber", {
 *   regex: "[0-9]{12}",
 *   keywords: ["account number", "acct no"],
 *   maximumMatchDistance: 30,
 *   severityLevels: [
 *     { occurrencesThreshold: 1, severity: "LOW" },
 *     { occurrencesThreshold: 25, severity: "HIGH" },
 *   ],
 * });
 * ```
 */
declare const CustomDataIdentifierResource: import("../../Resource.ts").ResourceClass<CustomDataIdentifier>;
export { CustomDataIdentifierResource as CustomDataIdentifier };
export declare const CustomDataIdentifierProvider: () => import("effect/Layer").Layer<Provider.Provider<CustomDataIdentifier>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=CustomDataIdentifier.d.ts.map