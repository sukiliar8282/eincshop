import * as ag from "@distilled.cloud/aws/api-gateway";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { deepEqual, isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, tagRecord } from "../../Tags.js";
import { syncTags } from "./common.js";
/**
 * Custom domain name for an Amazon API Gateway REST API.
 *
 * ### Custom domain
 * **Example:** Regional custom domain
 * ```typescript
 * const domain = yield* ApiGateway.DomainName("ApiDomain", {
 *   domainName: "api.example.com",
 *   regionalCertificateArn: cert.certificateArn,
 *   endpointConfiguration: { types: ["REGIONAL"] },
 *   securityPolicy: "TLS_1_2",
 * });
 * ```
 */
const DomainNameResource = Resource("AWS.ApiGateway.DomainName");
export { DomainNameResource as DomainName };
/** Unwrap an optional redacted secret for the wire / diff comparison. */
const redactedValue = (value) => value === undefined ? undefined : Redacted.value(value);
const retryDomainNameMutation = Effect.retry({
    while: (e) => e._tag === "ConflictException" || e._tag === "TooManyRequestsException",
    schedule: Schedule.spaced("1 second"),
    times: 8,
});
export const DomainNameProvider = () => Provider.effect(DomainNameResource, Effect.gen(function* () {
    return {
        stables: ["domainName"],
        diff: Effect.fn(function* ({ news: newsIn, olds }) {
            if (!isResolved(newsIn))
                return;
            const news = newsIn;
            if (news.domainName !== olds.domainName) {
                return { action: "replace" };
            }
            if (!deepEqual(news.endpointConfiguration, olds.endpointConfiguration)) {
                return { action: "replace" };
            }
            if (news.endpointAccessMode !== olds.endpointAccessMode) {
                return { action: "replace" };
            }
            if (news.certificateBody !== olds.certificateBody) {
                return { action: "replace" };
            }
            if (redactedValue(news.certificatePrivateKey) !==
                redactedValue(olds.certificatePrivateKey)) {
                return { action: "replace" };
            }
            if (news.certificateChain !== olds.certificateChain) {
                return { action: "replace" };
            }
            if (news.certificateName !== olds.certificateName) {
                return { action: "replace" };
            }
            if (news.regionalCertificateName !== olds.regionalCertificateName) {
                return { action: "replace" };
            }
            if (!deepEqual(news.mutualTlsAuthentication, olds.mutualTlsAuthentication)) {
                return { action: "replace" };
            }
            if (news.policy !== olds.policy) {
                return { action: "replace" };
            }
            if (news.routingMode !== olds.routingMode) {
                return { action: "replace" };
            }
            if (news.ownershipVerificationCertificateArn !==
                olds.ownershipVerificationCertificateArn) {
                return { action: "replace" };
            }
        }),
        list: () => ag.getDomainNames.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.items ?? [])
            .filter((d) => d.domainName != null)
            .map((d) => ({
            domainName: d.domainName,
            regionalDomainName: d.regionalDomainName,
            regionalHostedZoneId: d.regionalHostedZoneId,
            distributionDomainName: d.distributionDomainName,
            distributionHostedZoneId: d.distributionHostedZoneId,
            domainNameArn: d.domainNameArn,
            tags: tagRecord(d.tags),
        }))))),
        read: Effect.fn(function* ({ output }) {
            if (!output?.domainName)
                return undefined;
            const d = yield* ag
                .getDomainName({ domainName: output.domainName })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
            if (!d?.domainName)
                return undefined;
            return {
                domainName: d.domainName,
                regionalDomainName: d.regionalDomainName,
                regionalHostedZoneId: d.regionalHostedZoneId,
                distributionDomainName: d.distributionDomainName,
                distributionHostedZoneId: d.distributionHostedZoneId,
                domainNameArn: d.domainNameArn,
                tags: tagRecord(d.tags),
            };
        }),
        reconcile: Effect.fn(function* ({ id, news: newsIn, output, session }) {
            if (!isResolved(newsIn)) {
                return yield* Effect.die("DomainName props were not resolved");
            }
            const news = newsIn;
            const domainName = output?.domainName ?? news.domainName;
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // Observe — fetch the live domain name. Domain names are
            // user-supplied physical names so the lookup key is stable; we
            // never trust `output.tags`/`output.securityPolicy` etc. for
            // diffing, only re-read the cloud state.
            let observed = yield* ag
                .getDomainName({ domainName })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
            // Ensure — create the domain name if it's missing.
            if (!observed?.domainName) {
                yield* ag.createDomainName({
                    domainName: news.domainName,
                    certificateName: news.certificateName,
                    certificateBody: news.certificateBody,
                    certificatePrivateKey: redactedValue(news.certificatePrivateKey),
                    certificateChain: news.certificateChain,
                    certificateArn: news.certificateArn,
                    regionalCertificateName: news.regionalCertificateName,
                    regionalCertificateArn: news.regionalCertificateArn,
                    endpointConfiguration: news.endpointConfiguration,
                    tags: desiredTags,
                    securityPolicy: news.securityPolicy,
                    endpointAccessMode: news.endpointAccessMode,
                    mutualTlsAuthentication: news.mutualTlsAuthentication,
                    ownershipVerificationCertificateArn: news.ownershipVerificationCertificateArn,
                    policy: news.policy,
                    routingMode: news.routingMode,
                });
                yield* session.note(`Created domain name ${news.domainName}`);
                observed = yield* ag.getDomainName({ domainName });
            }
            // Sync mutable scalar fields — observed ↔ desired patch list.
            const patches = [];
            if (news.securityPolicy !== observed.securityPolicy) {
                patches.push({
                    op: news.securityPolicy === undefined ? "remove" : "replace",
                    path: "/securityPolicy",
                    value: news.securityPolicy,
                });
            }
            if (news.regionalCertificateArn !== observed.regionalCertificateArn) {
                patches.push({
                    op: news.regionalCertificateArn === undefined
                        ? "remove"
                        : "replace",
                    path: "/regionalCertificateArn",
                    value: news.regionalCertificateArn,
                });
            }
            if (news.certificateArn !== observed.certificateArn) {
                patches.push({
                    op: news.certificateArn === undefined ? "remove" : "replace",
                    path: "/certificateArn",
                    value: news.certificateArn,
                });
            }
            if (patches.length > 0) {
                // Domain name mutations can briefly conflict while API Gateway
                // propagates certificate, policy, or routing changes.
                yield* ag
                    .updateDomainName({
                    domainName,
                    patchOperations: patches,
                })
                    .pipe(retryDomainNameMutation);
            }
            // Sync tags — diff observed cloud tags against desired so adoption
            // converges without fighting whatever was already there.
            const observedTags = tagRecord(observed.tags);
            if (!deepEqual(observedTags, desiredTags) && observed.domainNameArn) {
                yield* syncTags({
                    resourceArn: observed.domainNameArn,
                    oldTags: observedTags,
                    newTags: desiredTags,
                });
            }
            yield* session.note(`Reconciled domain name ${domainName}`);
            const final = yield* ag.getDomainName({ domainName });
            return {
                domainName: final.domainName,
                regionalDomainName: final.regionalDomainName,
                regionalHostedZoneId: final.regionalHostedZoneId,
                distributionDomainName: final.distributionDomainName,
                distributionHostedZoneId: final.distributionHostedZoneId,
                domainNameArn: final.domainNameArn,
                tags: tagRecord(final.tags),
            };
        }),
        delete: Effect.fn(function* ({ output, session }) {
            yield* ag.deleteDomainName({ domainName: output.domainName }).pipe(Effect.catchTag("NotFoundException", () => Effect.void), retryDomainNameMutation);
            yield* session.note(`Deleted domain name ${output.domainName}`);
        }),
    };
}));
//# sourceMappingURL=DomainName.js.map