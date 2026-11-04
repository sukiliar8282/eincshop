import * as appsync from "@distilled.cloud/aws/appsync";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { Unowned } from "../../AdoptPolicy.js";
import { retryConcurrentModification, syncAppSyncTags, tagRecord, } from "./common.js";
/**
 * A custom domain name for AppSync GraphQL APIs.
 *
 * Requires an ACM certificate **in us-east-1** (the domain is
 * CloudFront-backed). Attach an API with {@link ApiAssociation} and point
 * DNS at the `appsyncDomainName` attribute.
 * ### Creating Custom Domains
 * **Example:** Custom domain + API association
 * ```typescript
 * const domain = yield* AppSync.DomainName("Domain", {
 *   domainName: "api.example.com",
 *   certificateArn: usEast1Cert.certificateArn,
 * });
 * yield* AppSync.ApiAssociation("Assoc", { domain, api });
 * // CNAME api.example.com → domain.appsyncDomainName
 * ```
 *
 * @resource
 */
export const DomainName = Resource("AWS.AppSync.DomainName");
export const DomainNameProvider = () => Provider.effect(DomainName, Effect.gen(function* () {
    const getDomainSafe = (domainName) => appsync.getDomainName({ domainName }).pipe(Effect.map((response) => response.domainNameConfig), Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    const toAttributes = (config) => ({
        domainName: config.domainName,
        domainNameArn: config.domainNameArn,
        certificateArn: config.certificateArn,
        appsyncDomainName: config.appsyncDomainName,
        hostedZoneId: config.hostedZoneId,
    });
    return DomainName.Provider.of({
        stables: [
            "domainName",
            "domainNameArn",
            "appsyncDomainName",
            "hostedZoneId",
        ],
        list: () => Effect.gen(function* () {
            const pages = yield* appsync.listDomainNames
                .pages({})
                .pipe(Stream.runCollect);
            return Array.from(pages)
                .flatMap((page) => page.domainNameConfigs ?? [])
                .filter((config) => config.domainName != null)
                .map(toAttributes);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const domainName = output?.domainName ?? olds?.domainName;
            if (domainName === undefined)
                return undefined;
            const config = yield* getDomainSafe(domainName);
            if (config?.domainName == null)
                return undefined;
            const attrs = toAttributes(config);
            return (yield* hasAlchemyTags(id, tagRecord(config.tags)))
                ? attrs
                : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (news.domainName !== olds.domainName ||
                news.certificateArn !== olds.certificateArn) {
                return { action: "replace" };
            }
            // description/tags converge via update
        }),
        reconcile: Effect.fn(function* ({ id, news, session }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE
            let observed = yield* getDomainSafe(news.domainName);
            if (observed?.domainName == null) {
                // 2. ENSURE
                const created = yield* retryConcurrentModification(appsync.createDomainName({
                    domainName: news.domainName,
                    certificateArn: news.certificateArn,
                    description: news.description,
                    tags: desiredTags,
                }));
                observed = created.domainNameConfig;
                yield* session.note(`Created domain ${news.domainName}`);
            }
            else if (news.description !== undefined &&
                observed.description !== news.description) {
                // 3. SYNC
                const updated = yield* retryConcurrentModification(appsync.updateDomainName({
                    domainName: news.domainName,
                    description: news.description,
                }));
                observed = updated.domainNameConfig ?? observed;
                yield* session.note(`Updated domain ${news.domainName}`);
            }
            // 3b. SYNC TAGS — against OBSERVED cloud tags.
            if (observed.domainNameArn !== undefined) {
                yield* syncAppSyncTags({
                    resourceArn: observed.domainNameArn,
                    oldTags: tagRecord(observed.tags),
                    newTags: desiredTags,
                });
            }
            yield* session.note(news.domainName);
            return toAttributes(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            // A domain with a live association cannot be deleted; the
            // association resource is destroyed first (dependency order),
            // but the detach itself is eventually consistent — the
            // ConcurrentModification retry rides that out.
            yield* retryConcurrentModification(appsync
                .deleteDomainName({ domainName: output.domainName })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void)));
        }),
    });
}));
//# sourceMappingURL=DomainName.js.map