import * as agw2 from "@distilled.cloud/aws/apigatewayv2";
import * as Effect from "effect/Effect";
import { deepEqual, isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
import { collectAllPages, domainNameArn, retryOnTooManyRequests, syncTags, tagRecord, } from "./common.js";
/**
 * An API Gateway v2 custom domain name.
 *
 * Requires a validated ACM certificate in the same region. Point DNS
 * (a Route 53 alias or CNAME) at the returned `ApiGatewayDomainName`
 * target and map APIs onto the domain with {@link ApiMapping}.
 * ### Custom domains
 * **Example:** Regional custom domain
 * ```typescript
 * const domain = yield* ApiGatewayV2.DomainName("Domain", {
 *   domainName: "api.example.com",
 *   domainNameConfigurations: [{
 *     CertificateArn: certificate.certificateArn,
 *     EndpointType: "REGIONAL",
 *     SecurityPolicy: "TLS_1_2",
 *   }],
 * });
 *
 * yield* ApiGatewayV2.ApiMapping("Mapping", {
 *   api,
 *   domainName: domain.domainName,
 *   stage: stage.stageName,
 * });
 * ```
 *
 * @resource
 */
export const DomainName = Resource("AWS.ApiGatewayV2.DomainName");
const snapshotFromDomain = (domain) => ({
    domainName: domain.DomainName,
    domainNameArn: domain.DomainNameArn,
    domainNameConfigurations: domain.DomainNameConfigurations,
    mutualTlsAuthentication: domain.MutualTlsAuthentication,
    routingMode: domain.RoutingMode,
    apiMappingSelectionExpression: domain.ApiMappingSelectionExpression,
    tags: tagRecord(domain.Tags),
});
export const DomainNameProvider = () => Provider.effect(DomainName, Effect.gen(function* () {
    const getDomainSafe = (domainName) => agw2
        .getDomainName({ DomainName: domainName })
        .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    return DomainName.Provider.of({
        stables: ["domainName", "domainNameArn"],
        list: () => Effect.gen(function* () {
            const items = yield* collectAllPages((NextToken) => agw2.getDomainNames({ NextToken }));
            return items
                .filter((domain) => domain.DomainName != null)
                .map((domain) => snapshotFromDomain(domain));
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const name = output?.domainName ?? olds?.domainName;
            if (!name)
                return undefined;
            const domain = yield* getDomainSafe(name);
            if (!domain?.DomainName)
                return undefined;
            return snapshotFromDomain(domain);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (news.domainName !== olds.domainName) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { region } = yield* AWSEnvironment.current;
            const name = output?.domainName ?? news.domainName;
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE — the domain name is the natural key.
            let observed = yield* getDomainSafe(name);
            // 2. ENSURE
            if (!observed?.DomainName) {
                observed = yield* retryOnTooManyRequests(agw2.createDomainName({
                    DomainName: name,
                    DomainNameConfigurations: news.domainNameConfigurations,
                    MutualTlsAuthentication: news.mutualTlsAuthentication,
                    RoutingMode: news.routingMode,
                    Tags: desiredTags,
                }));
                yield* session.note(`Created domain name ${name}`);
            }
            const snapshot = snapshotFromDomain(observed);
            // 3. SYNC — updateDomainName converges certificate/mTLS config.
            const desiredCerts = (news.domainNameConfigurations ?? []).map((config) => ({
                CertificateArn: config.CertificateArn,
                EndpointType: config.EndpointType,
                SecurityPolicy: config.SecurityPolicy,
            }));
            const observedCerts = (snapshot.domainNameConfigurations ?? []).map((config) => ({
                CertificateArn: config.CertificateArn,
                EndpointType: config.EndpointType,
                SecurityPolicy: config.SecurityPolicy,
            }));
            const drift = (news.domainNameConfigurations !== undefined &&
                !deepEqual(observedCerts, desiredCerts)) ||
                (news.routingMode !== undefined &&
                    snapshot.routingMode !== news.routingMode);
            if (drift) {
                yield* retryOnTooManyRequests(agw2.updateDomainName({
                    DomainName: name,
                    DomainNameConfigurations: news.domainNameConfigurations,
                    MutualTlsAuthentication: news.mutualTlsAuthentication,
                    RoutingMode: news.routingMode,
                }));
                yield* session.note(`Updated domain name ${name}`);
            }
            // 3b. SYNC TAGS — diff against OBSERVED cloud tags.
            if (!deepEqual(snapshot.tags, desiredTags)) {
                yield* syncTags({
                    resourceArn: snapshot.domainNameArn ?? domainNameArn(region, name),
                    oldTags: snapshot.tags,
                    newTags: desiredTags,
                });
            }
            // 4. RETURN fresh state.
            const final = yield* agw2.getDomainName({ DomainName: name });
            yield* session.note(`Reconciled domain name ${name}`);
            return snapshotFromDomain(final);
        }),
        delete: Effect.fn(function* ({ output, session }) {
            yield* retryOnTooManyRequests(agw2
                .deleteDomainName({ DomainName: output.domainName })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void)));
            yield* session.note(`Deleted domain name ${output.domainName}`);
        }),
    });
}));
//# sourceMappingURL=DomainName.js.map