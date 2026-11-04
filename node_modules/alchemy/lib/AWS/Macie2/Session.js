import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Effect from "effect/Effect";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { AWSEnvironment } from "../Environment.js";
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
const SessionResource = Resource("AWS.Macie2.Session");
export { SessionResource as Session };
// `getMacieSession` throws `AccessDeniedException` ("Macie is not enabled")
// when the account has no session and `ResourceNotFoundException` transiently
// right after enablement — both mean "no session", so collapse to `undefined`.
const getSession = macie2.getMacieSession({}).pipe(Effect.map((s) => s), Effect.catchTag("AccessDeniedException", () => Effect.succeed(undefined)), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
const buildAttrs = (accountId, s) => ({
    accountId,
    status: s.status,
    findingPublishingFrequency: s.findingPublishingFrequency,
    serviceRole: s.serviceRole,
    createdAt: s.createdAt?.toISOString(),
});
export const SessionProvider = () => Provider.effect(SessionResource, Effect.gen(function* () {
    return {
        read: Effect.fn(function* ({ output }) {
            const session = yield* getSession;
            if (!session)
                return undefined;
            const accountId = output?.accountId ?? (yield* AWSEnvironment.current).accountId;
            const attrs = buildAttrs(accountId, session);
            // Macie has no session-level tags, so ownership cannot be verified
            // from the cloud. If we have no prior state (`output` absent) but a
            // session already exists, treat it as foreign and gate adoption.
            return output ? attrs : Unowned(attrs);
        }),
        // Account/region singleton — report the single session, if any.
        list: () => Effect.gen(function* () {
            const session = yield* getSession;
            if (!session)
                return [];
            const { accountId } = yield* AWSEnvironment.current;
            return [buildAttrs(accountId, session)];
        }),
        reconcile: Effect.fn(function* ({ news = {}, session }) {
            const { accountId } = yield* AWSEnvironment.current;
            const desiredStatus = news.status ?? "ENABLED";
            // 1. OBSERVE — cloud state is authoritative.
            let live = yield* getSession;
            // 2. ENSURE — enable Macie if there is no session.
            if (!live) {
                yield* macie2.enableMacie({
                    status: desiredStatus,
                    findingPublishingFrequency: news.findingPublishingFrequency,
                });
                live = yield* macie2.getMacieSession({});
            }
            else {
                // 3. SYNC — observed ↔ desired status + finding frequency.
                const statusChanged = live.status !== desiredStatus;
                const freqChanged = news.findingPublishingFrequency !== undefined &&
                    news.findingPublishingFrequency !==
                        live.findingPublishingFrequency;
                if (statusChanged || freqChanged) {
                    yield* macie2.updateMacieSession({
                        status: desiredStatus,
                        findingPublishingFrequency: news.findingPublishingFrequency,
                    });
                }
            }
            // 4. RETURN fresh attributes.
            const final = yield* macie2.getMacieSession({});
            yield* session.note(accountId);
            return buildAttrs(accountId, final);
        }),
        delete: Effect.fn(function* () {
            yield* macie2.disableMacie({}).pipe(Effect.catchTag("AccessDeniedException", () => Effect.void), Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Session.js.map