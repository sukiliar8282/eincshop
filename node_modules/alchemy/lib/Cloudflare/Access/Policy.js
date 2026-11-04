import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
/** Rule kind → its single parameter's (camelCase) member name. */
const SCALAR_RULE_PARAMS = {
    email: "email",
    emailDomain: "domain",
    emailList: "id",
    ip: "ip",
    ipList: "id",
    group: "id",
    loginMethod: "id",
    serviceToken: "tokenId",
    geo: "countryCode",
    authMethod: "authMethod",
    devicePosture: "integrationUid",
    commonName: "commonName",
    linkedAppToken: "appUid",
    userRiskScore: "userRiskScore",
    cloudflareAccountMember: "accountId",
};
/**
 * Expand the scalar shorthand to Cloudflare's wire shape; wire-shaped rules
 * pass through untouched.
 */
export const normalizePolicyRule = (rule) => {
    if (typeof rule === "string") {
        // "everyone" -> { everyone: {} }
        return { [rule]: {} };
    }
    const keys = Object.keys(rule);
    if (keys.length === 1) {
        const kind = keys[0];
        const value = rule[kind];
        const param = SCALAR_RULE_PARAMS[kind];
        if (param !== undefined && (value === null || typeof value !== "object")) {
            return { [kind]: { [param]: value } };
        }
    }
    return rule;
};
export function normalizePolicyRules(rules) {
    return rules === undefined
        ? undefined
        : rules.map((r) => normalizePolicyRule(r));
}
/**
 * A reusable, account-scoped Cloudflare Access policy. Distinct from the
 * inline policies attached directly to an `Application` — a reusable
 * policy can be referenced by multiple applications by id.
 * ### Creating a Policy
 * **Example:** Allow a single email domain
 * ```typescript
 * const policy = yield* Cloudflare.Access.Policy("AllowExampleDomain", {
 *   decision: "allow",
 *   include: [{ emailDomain: { domain: "example.com" } }],
 * });
 * ```
 *
 * **Example:** Allow everyone but require purpose justification
 * ```typescript
 * const policy = yield* Cloudflare.Access.Policy("OpenWithJustification", {
 *   decision: "allow",
 *   include: [{ everyone: {} }],
 *   purposeJustificationRequired: true,
 *   sessionDuration: "12h",
 * });
 * ```
 *
 * ### Combining rule groups
 * **Example:** Include + exclude + require
 * ```typescript
 * const policy = yield* Cloudflare.Access.Policy("EngineersExceptInterns", {
 *   decision: "allow",
 *   include: [{ emailDomain: { domain: "example.com" } }],
 *   exclude: [{ email: { email: "intern@example.com" } }],
 *   require: [{ geo: { countryCode: "US" } }],
 * });
 * ```
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export const Policy = Resource("Cloudflare.Access.Policy", {
    aliases: ["Cloudflare.AccessPolicy"],
});
export const PolicyProvider = () => Provider.succeed(Policy, {
    stables: ["policyId", "accountId", "decision"],
    diff: Effect.fn(function* ({ id, olds = {}, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (!isResolved(news))
            return undefined;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        const oldName = output?.name ?? (yield* createPolicyName(id, olds.name));
        // Auto-generated names are engine-owned: the deployed name stays
        // authoritative even if the generator would name this id differently
        // today. Only an explicit user-provided name can force a replace.
        const name = news.name ?? oldName;
        if (name !== oldName) {
            return { action: "replace" };
        }
        const oldDecision = output?.decision ?? olds.decision;
        if (oldDecision && oldDecision !== news.decision) {
            return { action: "replace" };
        }
    }),
    reconcile: Effect.fn(function* ({ id, news = {}, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Prefer the deployed name: regenerating would target a different
        // resource if the generator's output for this id ever drifts.
        const name = yield* createPolicyName(id, news.name ?? output?.name);
        const acct = output?.accountId ?? accountId;
        // Observe — prefer cached policyId, fall back to a name lookup so
        // we recover from out-of-band deletes and partial state-persistence
        // failures.
        let observed;
        if (output?.policyId) {
            observed = yield* zeroTrust
                .getAccessPolicy({
                accountId: acct,
                policyId: output.policyId,
            })
                .pipe(Effect.map(toObserved), Effect.catch(() => Effect.succeed(undefined)));
        }
        if (!observed) {
            observed = yield* findPolicyByName(acct, name);
        }
        // Ensure — create the policy if missing. Tolerate a race where a
        // parallel actor created the same-named policy by re-observing.
        let ensured;
        if (!observed || !observed.id) {
            ensured = yield* zeroTrust
                .createAccessPolicy({
                accountId: acct,
                name,
                decision: news.decision,
                include: normalizePolicyRules(news.include),
                exclude: normalizePolicyRules(news.exclude),
                require: normalizePolicyRules(news.require),
                sessionDuration: news.sessionDuration,
                approvalRequired: news.approvalRequired,
                purposeJustificationRequired: news.purposeJustificationRequired,
            })
                .pipe(Effect.map(toObserved), Effect.catch((err) => Effect.gen(function* () {
                const existing = yield* findPolicyByName(acct, name);
                if (existing && existing.id)
                    return existing;
                return yield* Effect.fail(err);
            })));
        }
        else {
            // Sync — Cloudflare PUTs the policy as a whole replacement, so a
            // single update converges every mutable field. Always issuing the
            // PUT keeps the resource convergent against drift; the API is
            // idempotent for equal payloads.
            const prior = observed;
            const updated = yield* zeroTrust.updateAccessPolicy({
                accountId: acct,
                policyId: prior.id,
                name,
                decision: news.decision,
                include: normalizePolicyRules(news.include),
                exclude: normalizePolicyRules(news.exclude),
                require: normalizePolicyRules(news.require),
                sessionDuration: news.sessionDuration,
                approvalRequired: news.approvalRequired,
                purposeJustificationRequired: news.purposeJustificationRequired,
            });
            ensured = {
                id: updated.id ?? prior.id,
                name: updated.name ?? prior.name,
                decision: updated.decision ?? prior.decision,
                createdAt: updated.createdAt ?? prior.createdAt,
                updatedAt: updated.updatedAt ?? prior.updatedAt,
            };
        }
        if (!ensured.id) {
            return yield* Effect.fail(new Error("Policy: ensured policy missing id"));
        }
        return {
            policyId: ensured.id,
            name: ensured.name ?? name,
            decision: ensured.decision ?? news.decision,
            accountId: acct,
            createdAt: ensured.createdAt ?? undefined,
            updatedAt: ensured.updatedAt ?? undefined,
        };
    }),
    // Account-scoped collection (pattern (b)): enumerate every reusable
    // Access policy in the ambient account, exhaustively paginated, and
    // hydrate each into the exact `read` Attributes shape. Items missing the
    // mandatory id are skipped (typed per-item drop).
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* zeroTrust.listAccessPolicies.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).flatMap((raw) => {
            const observed = toObserved(raw);
            if (!observed.id)
                return [];
            return [
                {
                    policyId: observed.id,
                    name: observed.name ?? "",
                    decision: observed.decision ?? "allow",
                    accountId,
                    createdAt: observed.createdAt ?? undefined,
                    updatedAt: observed.updatedAt ?? undefined,
                },
            ];
        }))));
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* zeroTrust
            .deleteAccessPolicy({
            accountId: output.accountId,
            policyId: output.policyId,
        })
            .pipe(Effect.catch(() => Effect.void));
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.policyId) {
            const direct = yield* zeroTrust
                .getAccessPolicy({
                accountId: acct,
                policyId: output.policyId,
            })
                .pipe(Effect.catch(() => Effect.succeed(undefined)));
            if (direct && direct.id) {
                return {
                    policyId: direct.id,
                    name: direct.name ?? output.name,
                    decision: direct.decision ?? output.decision,
                    accountId: acct,
                    createdAt: direct.createdAt ?? output.createdAt,
                    updatedAt: direct.updatedAt ?? output.updatedAt,
                };
            }
        }
        const name = yield* createPolicyName(id, olds?.name ?? output?.name);
        const existing = yield* findPolicyByName(acct, name);
        if (!existing || !existing.id)
            return undefined;
        return {
            policyId: existing.id,
            name: existing.name ?? name,
            decision: existing.decision ?? olds?.decision ?? "allow",
            accountId: acct,
            createdAt: existing.createdAt ?? undefined,
            updatedAt: existing.updatedAt ?? undefined,
        };
    }),
});
const createPolicyName = (id, name) => Effect.gen(function* () {
    if (name)
        return name;
    return yield* createPhysicalName({ id });
});
const findPolicyByName = (acct, name) => zeroTrust.listAccessPolicies.items({ accountId: acct }).pipe(Stream.filter((p) => p.name === name), Stream.runHead, Effect.map(Option.getOrUndefined), Effect.catch(() => Effect.succeed(undefined)));
const toObserved = (r) => ({
    id: r.id,
    name: r.name,
    decision: r.decision ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
});
//# sourceMappingURL=Policy.js.map