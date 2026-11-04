import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, } from "../../Tags.js";
/**
 * An Amazon Q Business web experience — the hosted chat UI end users open
 * to converse with an application.
 *
 * ### Creating Web Experiences
 * **Example:** Basic Web Experience
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const web = yield* AWS.QBusiness.WebExperience("Chat", {
 *   applicationId: app.applicationId,
 *   title: "Company Assistant",
 *   welcomeMessage: "Ask me anything about our docs.",
 * });
 * ```
 *
 * **Example:** Embeddable Web Experience
 * ```typescript
 * const web = yield* AWS.QBusiness.WebExperience("Chat", {
 *   applicationId: app.applicationId,
 *   origins: ["https://intranet.example.com"],
 *   samplePromptsControlMode: "ENABLED",
 * });
 * ```
 *
 * @resource
 */
export const WebExperience = Resource("AWS.QBusiness.WebExperience");
const fetchTags = Effect.fn(function* (arn) {
    const response = yield* qbusiness
        .listTagsForResource({ resourceARN: arn })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    return Object.fromEntries((response?.tags ?? []).map((tag) => [tag.key, tag.value]));
});
const readWebExperienceById = Effect.fn(function* (applicationId, webExperienceId) {
    const described = yield* qbusiness
        .getWebExperience({ applicationId, webExperienceId })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (!described || described.status === "DELETING")
        return undefined;
    const arn = described.webExperienceArn;
    if (arn === undefined)
        return undefined;
    const state = {
        described,
        attrs: {
            webExperienceId: described.webExperienceId ?? webExperienceId,
            applicationId: described.applicationId ?? applicationId,
            webExperienceArn: arn,
            defaultEndpoint: described.defaultEndpoint,
            status: described.status,
            tags: yield* fetchTags(arn),
        },
    };
    return state;
});
/**
 * A web experience still transitioning toward a settled status — retried by
 * {@link waitForWebExperienceSettled}'s bounded schedule.
 */
class WebExperienceNotReady extends Data.TaggedError("WebExperienceNotReady") {
}
/**
 * A web experience whose asynchronous provisioning converged to the
 * terminal `FAILED` status.
 */
export class WebExperienceProvisioningFailed extends Data.TaggedError("WebExperienceProvisioningFailed") {
}
// Explicitly-typed retry wrapper — an inline `Effect.retry` in provider
// lifecycle code leaks `Retry.Return`'s conditional type into declaration
// emit and widens the provider layer to `unknown` for every consumer of
// `AWS.providers()`.
const retryWhileNotReady = (self) => Effect.retry(self, {
    while: (e) => e._tag === "WebExperienceNotReady",
    // Web experience provisioning is fast; poll every 5s up to ~5 min.
    schedule: Schedule.max([Schedule.spaced("5 seconds"), Schedule.recurs(60)]),
});
// A web experience without identity-provider auth settles in
// PENDING_AUTH_CONFIG rather than ACTIVE — both are converged states.
const waitForWebExperienceSettled = (applicationId, webExperienceId, target) => retryWhileNotReady(Effect.gen(function* () {
    const described = yield* qbusiness
        .getWebExperience({ applicationId, webExperienceId })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (target === "DELETED") {
        if (described === undefined)
            return;
        return yield* Effect.fail(new WebExperienceNotReady({
            webExperienceId,
            status: described.status,
        }));
    }
    if (described?.status === "ACTIVE" ||
        described?.status === "PENDING_AUTH_CONFIG") {
        return;
    }
    if (described?.status === "FAILED") {
        return yield* Effect.fail(new WebExperienceProvisioningFailed({
            webExperienceId,
            message: described.error?.errorMessage,
        }));
    }
    return yield* Effect.fail(new WebExperienceNotReady({
        webExperienceId,
        status: described?.status,
    }));
}));
export const WebExperienceProvider = () => Provider.effect(WebExperience, Effect.gen(function* () {
    return {
        stables: ["webExperienceId", "applicationId", "webExperienceArn"],
        // Keyed by a parent application; cannot be enumerated account-wide
        // without iterating every application — treated as a sub-resource per
        // the factory list() convention.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const applicationId = output?.applicationId ?? olds?.applicationId;
            // Web experience summaries carry no display name, so there is no
            // name-based fallback — without a cached id the resource is
            // treated as missing.
            if (applicationId === undefined ||
                output?.webExperienceId === undefined) {
                return undefined;
            }
            const state = yield* readWebExperienceById(applicationId, output.webExperienceId);
            if (!state)
                return undefined;
            return (yield* hasAlchemyTags(id, state.attrs.tags))
                ? state.attrs
                : Unowned(state.attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            if (olds === undefined)
                return;
            // The parent application is fixed at creation.
            if (olds.applicationId !== news.applicationId) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            if (!news) {
                return yield* Effect.fail(new Error("QBusiness WebExperience requires props"));
            }
            const applicationId = news.applicationId;
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe — the cached id is the only handle (summaries carry no
            // display name to search by).
            let state = output?.webExperienceId
                ? yield* readWebExperienceById(applicationId, output.webExperienceId)
                : undefined;
            // Ensure — create if missing, then wait for a settled status.
            if (state === undefined) {
                const created = yield* qbusiness.createWebExperience({
                    applicationId,
                    title: news.title,
                    subtitle: news.subtitle,
                    welcomeMessage: news.welcomeMessage,
                    samplePromptsControlMode: news.samplePromptsControlMode,
                    origins: news.origins,
                    roleArn: news.roleArn,
                    identityProviderConfiguration: news.identityProviderConfiguration,
                    browserExtensionConfiguration: news.browserExtensionConfiguration,
                    customizationConfiguration: news.customizationConfiguration,
                    tags: Object.entries(desiredTags).map(([key, value]) => ({
                        key,
                        value,
                    })),
                });
                if (!created.webExperienceId) {
                    return yield* Effect.fail(new Error(`CreateWebExperience for '${id}' returned no webExperienceId`));
                }
                yield* session.note(`Creating web experience (${created.webExperienceId})...`);
                yield* waitForWebExperienceSettled(applicationId, created.webExperienceId, "SETTLED");
                state = yield* readWebExperienceById(applicationId, created.webExperienceId);
                if (state === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created web experience for '${id}'`));
                }
            }
            // Sync mutable settings via UpdateWebExperience — only when
            // drifted.
            const described = state.described;
            const needsUpdate = (news.title ?? "") !== (described.title ?? "") ||
                (news.subtitle ?? "") !== (described.subtitle ?? "") ||
                (news.welcomeMessage ?? "") !== (described.welcomeMessage ?? "") ||
                (news.samplePromptsControlMode !== undefined &&
                    news.samplePromptsControlMode !==
                        described.samplePromptsControlMode) ||
                (news.roleArn !== undefined &&
                    news.roleArn !== described.roleArn) ||
                JSON.stringify(news.origins ?? []) !==
                    JSON.stringify(described.origins ?? []) ||
                news.identityProviderConfiguration !== undefined ||
                news.browserExtensionConfiguration !== undefined ||
                news.customizationConfiguration !== undefined;
            if (needsUpdate) {
                yield* qbusiness.updateWebExperience({
                    applicationId,
                    webExperienceId: state.attrs.webExperienceId,
                    title: news.title,
                    subtitle: news.subtitle,
                    welcomeMessage: news.welcomeMessage,
                    samplePromptsControlMode: news.samplePromptsControlMode,
                    origins: news.origins,
                    roleArn: news.roleArn,
                    identityProviderConfiguration: news.identityProviderConfiguration,
                    browserExtensionConfiguration: news.browserExtensionConfiguration,
                    customizationConfiguration: news.customizationConfiguration,
                });
                yield* waitForWebExperienceSettled(applicationId, state.attrs.webExperienceId, "SETTLED");
                yield* session.note(`Updated web experience ${id}`);
            }
            // Sync tags — diff against observed cloud tags.
            const { removed, upsert } = diffTags(state.attrs.tags, desiredTags);
            if (removed.length > 0) {
                yield* qbusiness.untagResource({
                    resourceARN: state.attrs.webExperienceArn,
                    tagKeys: removed,
                });
            }
            if (upsert.length > 0) {
                yield* qbusiness.tagResource({
                    resourceARN: state.attrs.webExperienceArn,
                    tags: upsert.map(({ Key, Value }) => ({
                        key: Key,
                        value: Value,
                    })),
                });
            }
            yield* session.note(state.attrs.webExperienceArn);
            const final = yield* readWebExperienceById(applicationId, state.attrs.webExperienceId);
            if (!final) {
                return yield* Effect.fail(new Error(`failed to read reconciled web experience for '${id}'`));
            }
            return final.attrs;
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* qbusiness
                .deleteWebExperience({
                applicationId: output.applicationId,
                webExperienceId: output.webExperienceId,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            yield* waitForWebExperienceSettled(output.applicationId, output.webExperienceId, "DELETED");
        }),
    };
}));
//# sourceMappingURL=WebExperience.js.map