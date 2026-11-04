import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * How frequently Amazon Macie publishes updated policy findings.
 */
export type FindingPublishingFrequency = "FIFTEEN_MINUTES" | "ONE_HOUR" | "SIX_HOURS";
/**
 * The Macie enablement status. `ENABLED` runs Macie; `PAUSED` suspends it
 * without disabling the account entirely.
 */
export type MacieStatus = "PAUSED" | "ENABLED";
export interface SessionProps {
    /**
     * Whether Macie is enabled (`ENABLED`) or suspended (`PAUSED`) for the
     * account. A paused session stops all Macie activity but keeps the account
     * enrolled.
     * @default "ENABLED"
     */
    status?: MacieStatus;
    /**
     * How frequently Macie publishes updated policy findings to EventBridge and
     * Security Hub.
     * @default "SIX_HOURS"
     */
    findingPublishingFrequency?: FindingPublishingFrequency;
}
/** @resource */
export interface Session extends Resource<"AWS.Macie2.Session", SessionProps, {
    /** The account the Macie session belongs to. */
    accountId: string;
    /** Current Macie status (`ENABLED` / `PAUSED`). */
    status: string | undefined;
    /** The effective finding-publishing frequency. */
    findingPublishingFrequency: string | undefined;
    /** ARN of the Macie service-linked role. */
    serviceRole: string | undefined;
    /** ISO timestamp of when the Macie session was created. */
    createdAt: string | undefined;
}, never, Providers> {
}
/**
 * The Amazon Macie session — the account/region singleton that enables Macie
 * data-security scanning. Only one session can exist per region, so this is a
 * capture-and-restore singleton: Macie exposes no session tags, so ownership is
 * tracked by Alchemy state. Adopting a session that Alchemy did not create
 * requires `--adopt`, and destroy disables Macie for the account.
 *
 * ### Enabling Macie
 * **Example:** Enable Macie
 * ```typescript
 * const macie = yield* Macie2.Session("Macie", {});
 * ```
 *
 * **Example:** Enable with frequent findings and pause later
 * ```typescript
 * const macie = yield* Macie2.Session("Macie", {
 *   status: "ENABLED",
 *   findingPublishingFrequency: "FIFTEEN_MINUTES",
 * });
 * ```
 */
declare const SessionResource: import("../../Resource.ts").ResourceClass<Session>;
export { SessionResource as Session };
export declare const SessionProvider: () => import("effect/Layer").Layer<Provider.Provider<Session>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Session.d.ts.map