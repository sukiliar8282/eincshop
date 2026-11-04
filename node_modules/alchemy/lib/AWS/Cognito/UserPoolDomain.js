import * as cip from "@distilled.cloud/aws/cognito-identity-provider";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * A domain for an Amazon Cognito user pool's managed login and OAuth 2.0
 * authorization server. Cognito-prefix domains
 * (`<prefix>.auth.<region>.amazoncognito.com`) provision in seconds; custom
 * domains require an ACM certificate in us-east-1 and can take 15-60 minutes.
 * ### Creating a Domain
 * **Example:** Cognito-Prefix Domain
 * ```typescript
 * import * as Cognito from "alchemy/AWS/Cognito";
 *
 * const pool = yield* Cognito.UserPool("Users", {});
 * const domain = yield* Cognito.UserPoolDomain("AuthDomain", {
 *   userPoolId: pool.userPoolId,
 * });
 * ```
 *
 * **Example:** Explicit Prefix
 * ```typescript
 * const domain = yield* Cognito.UserPoolDomain("AuthDomain", {
 *   userPoolId: pool.userPoolId,
 *   domain: "my-app-auth",
 * });
 * ```
 *
 * ### Custom Domains
 * **Example:** Custom Domain with an ACM Certificate
 * ```typescript
 * const domain = yield* Cognito.UserPoolDomain("AuthDomain", {
 *   userPoolId: pool.userPoolId,
 *   domain: "auth.example.com",
 *   certificateArn: certificate.certificateArn, // must be us-east-1
 * });
 * ```
 *
 * @resource
 */
export const UserPoolDomain = Resource("AWS.Cognito.UserPoolDomain");
class DomainNotActive extends Data.TaggedError("DomainNotActive") {
}
/**
 * Cognito rejects domain prefixes containing the reserved words below, and
 * requires lowercase alphanumerics/hyphens. Deterministically sanitize the
 * generated physical name.
 */
const sanitizeDomainPrefix = (name) => {
    let sanitized = name.toLowerCase().replaceAll(/[^a-z0-9-]/g, "-");
    for (const [reserved, replacement] of [
        ["amazon", "amzn"],
        ["cognito", "cgnto"],
        ["aws", "ws"],
    ]) {
        while (sanitized.includes(reserved)) {
            sanitized = sanitized.replaceAll(reserved, replacement);
        }
    }
    return sanitized.replaceAll(/^-+|-+$/g, "").slice(0, 63);
};
/**
 * Bounded retry while the domain has not yet reached ACTIVE. Explicitly
 * typed so the conditional `Retry.Return` type never leaks into declaration
 * emit (which would widen the provider layer to an `unknown` R).
 */
const retryWhileNotActive = (self) => Effect.retry(self, {
    while: (e) => e._tag === "DomainNotActive",
    schedule: Schedule.max([Schedule.fixed("2 seconds"), Schedule.recurs(30)]),
});
/** Bounded wait for the domain to reach ACTIVE (up to ~60s). */
const waitUntilActive = (domain) => retryWhileNotActive(cip.describeUserPoolDomain({ Domain: domain }).pipe(Effect.flatMap((r) => {
    const description = r.DomainDescription;
    if (description?.UserPoolId !== undefined &&
        (description.Status === "ACTIVE" || description.Status === undefined)) {
        return Effect.succeed(description);
    }
    return Effect.fail(new DomainNotActive({ domain, status: description?.Status }));
})));
export const UserPoolDomainProvider = () => Provider.effect(UserPoolDomain, Effect.gen(function* () {
    const createDomain = Effect.fn(function* (id, props) {
        if (props.domain)
            return props.domain;
        const generated = yield* createPhysicalName({
            id,
            maxLength: 63,
            lowercase: true,
        });
        return sanitizeDomainPrefix(generated);
    });
    const describeDomain = Effect.fn(function* (domain) {
        const result = yield* cip
            .describeUserPoolDomain({ Domain: domain })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({})));
        const description = result.DomainDescription;
        // Cognito returns an empty description (no UserPoolId) for a
        // non-existent domain rather than a NotFound error.
        return description?.UserPoolId === undefined ? undefined : description;
    });
    const attributesOf = (description) => ({
        domain: description.Domain,
        userPoolId: description.UserPoolId,
        cloudFrontDomain: description.CloudFrontDistribution,
    });
    return UserPoolDomain.Provider.of({
        stables: ["domain", "userPoolId"],
        // Sub-resource keyed entirely by its user pool (userPoolId) with no global
        // enumeration API of its own — nuke reaches it through the parent's
        // deletion, so enumeration returns empty per the ProviderService
        // doctrine.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const domain = output?.domain ?? (yield* createDomain(id, olds ?? {}));
            const observed = yield* describeDomain(domain);
            return observed === undefined ? undefined : attributesOf(observed);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldDomain = yield* createDomain(id, olds ?? {});
            const newDomain = yield* createDomain(id, news ?? {});
            if (oldDomain !== newDomain)
                return { action: "replace" };
            if (olds?.userPoolId !== news?.userPoolId) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const domain = output?.domain ?? (yield* createDomain(id, news));
            // 1. OBSERVE
            let observed = yield* describeDomain(domain);
            // 2. ENSURE
            if (observed === undefined) {
                yield* cip.createUserPoolDomain({
                    Domain: domain,
                    UserPoolId: news.userPoolId,
                    ManagedLoginVersion: news.managedLoginVersion,
                    CustomDomainConfig: news.certificateArn === undefined
                        ? undefined
                        : { CertificateArn: news.certificateArn },
                });
                observed = yield* waitUntilActive(domain);
            }
            else {
                // 3. SYNC — branding version / certificate are mutable in place.
                const drift = (news.managedLoginVersion !== undefined &&
                    observed.ManagedLoginVersion !== news.managedLoginVersion) ||
                    (news.certificateArn !== undefined &&
                        observed.CustomDomainConfig?.CertificateArn !==
                            news.certificateArn);
                if (drift) {
                    yield* cip.updateUserPoolDomain({
                        Domain: domain,
                        UserPoolId: news.userPoolId,
                        ManagedLoginVersion: news.managedLoginVersion,
                        CustomDomainConfig: news.certificateArn === undefined
                            ? undefined
                            : { CertificateArn: news.certificateArn },
                    });
                    observed = yield* waitUntilActive(domain);
                }
            }
            yield* session.note(domain);
            return attributesOf({ ...observed, Domain: domain });
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* cip
                .deleteUserPoolDomain({
                Domain: output.domain,
                UserPoolId: output.userPoolId,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), 
            // The domain briefly rejects deletion while still provisioning
            // or updating; InvalidParameterException surfaces that window.
            (self) => retryWhileTransitioning(self));
        }),
    });
}));
/**
 * Bounded retry over the delete-while-transitioning window. Explicitly typed
 * (see {@link retryWhileNotActive}) to keep declaration emit clean.
 */
const retryWhileTransitioning = (self) => Effect.retry(self, {
    while: (e) => e._tag === "InvalidParameterException" ||
        e._tag === "ConcurrentModificationException",
    schedule: Schedule.max([Schedule.fixed("2 seconds"), Schedule.recurs(10)]),
});
//# sourceMappingURL=UserPoolDomain.js.map