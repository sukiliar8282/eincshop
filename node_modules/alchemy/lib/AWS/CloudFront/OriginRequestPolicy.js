import * as cloudfront from "@distilled.cloud/aws/cloudfront";
import * as Effect from "effect/Effect";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * A CloudFront origin request policy.
 *
 * Origin request policies control which values from the viewer request (in
 * addition to those used in the cache key) CloudFront includes when sending
 * a request to the origin. They are referenced by ID on a Distribution's
 * default behavior or per-path cache behaviors.
 * ### Creating Origin Request Policies
 * **Example:** Forward all viewer headers and cookies
 * ```typescript
 * const originRequestPolicy = yield* OriginRequestPolicy("AppOriginRequest", {
 *   comment: "Forward auth + locale",
 *   headersConfig: {
 *     HeaderBehavior: "whitelist",
 *     Headers: { Quantity: 2, Items: ["Authorization", "Accept-Language"] },
 *   },
 *   cookiesConfig: { CookieBehavior: "all" },
 *   queryStringsConfig: { QueryStringBehavior: "all" },
 * });
 * ```
 *
 * @resource
 */
export const OriginRequestPolicy = Resource("AWS.CloudFront.OriginRequestPolicy");
export const OriginRequestPolicyProvider = () => Provider.effect(OriginRequestPolicy, Effect.gen(function* () {
    const getById = Effect.fn(function* (id) {
        const config = yield* cloudfront
            .getOriginRequestPolicyConfig({ Id: id })
            .pipe(Effect.catchTag("NoSuchOriginRequestPolicy", () => Effect.succeed(undefined)));
        if (!config?.OriginRequestPolicyConfig)
            return undefined;
        return { config: config.OriginRequestPolicyConfig, etag: config.ETag };
    });
    const getByName = Effect.fn(function* (name) {
        const listed = yield* cloudfront.listOriginRequestPolicies({
            Type: "custom",
        });
        const summary = listed.OriginRequestPolicyList?.Items?.find((item) => item.OriginRequestPolicy?.OriginRequestPolicyConfig?.Name === name);
        if (!summary?.OriginRequestPolicy?.Id)
            return undefined;
        return yield* getById(summary.OriginRequestPolicy.Id).pipe(Effect.map((found) => found
            ? { id: summary.OriginRequestPolicy.Id, ...found }
            : undefined));
    });
    const buildConfig = (name, props) => ({
        Name: name,
        Comment: props.comment,
        HeadersConfig: props.headersConfig,
        CookiesConfig: props.cookiesConfig,
        QueryStringsConfig: props.queryStringsConfig,
    });
    const toAttrs = (id, config, etag) => ({
        originRequestPolicyId: id,
        name: config.Name,
        etag,
        comment: config.Comment,
        headersConfig: config.HeadersConfig,
        cookiesConfig: config.CookiesConfig,
        queryStringsConfig: config.QueryStringsConfig,
    });
    return {
        stables: ["originRequestPolicyId"],
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* createName(id, olds ?? {})) !==
                (yield* createName(id, news))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            if (output?.originRequestPolicyId) {
                const found = yield* getById(output.originRequestPolicyId);
                if (found) {
                    return toAttrs(output.originRequestPolicyId, found.config, found.etag);
                }
            }
            const name = yield* createName(id, olds ?? {});
            const found = yield* getByName(name);
            if (!found)
                return undefined;
            return toAttrs(found.id, found.config, found.etag);
        }),
        // CloudFront is global (no region). `listOriginRequestPolicies`
        // returns both AWS-managed and custom policies; we filter to
        // `Type: "custom"` since those are the only ones we create/delete.
        // The op is marker-paginated (no `.pages`), so we loop until
        // `NextMarker` is exhausted and hydrate each summary's ETag via
        // `getById` so every row matches read().
        list: () => Effect.gen(function* () {
            const items = [];
            let marker = undefined;
            do {
                const listed = yield* cloudfront.listOriginRequestPolicies({
                    Type: "custom",
                    Marker: marker,
                });
                for (const summary of listed.OriginRequestPolicyList?.Items ??
                    []) {
                    if (summary.Type !== "custom")
                        continue;
                    const id = summary.OriginRequestPolicy?.Id;
                    const config = summary.OriginRequestPolicy?.OriginRequestPolicyConfig;
                    if (!id || !config)
                        continue;
                    const found = yield* getById(id);
                    items.push(toAttrs(id, found?.config ?? config, found?.etag));
                }
                marker = listed.OriginRequestPolicyList?.NextMarker;
            } while (marker);
            return items;
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = yield* createName(id, news);
            // Observe — locate the policy by id (cached on `output`) or
            // by name. Trust observed cloud state, not stale `olds`.
            let observed = output?.originRequestPolicyId
                ? yield* getById(output.originRequestPolicyId).pipe(Effect.map((found) => found
                    ? { id: output.originRequestPolicyId, ...found }
                    : undefined))
                : undefined;
            if (!observed) {
                observed = yield* getByName(name);
            }
            // Ensure — create the policy if it's missing. Tolerate
            // `OriginRequestPolicyAlreadyExists` (race with a peer
            // reconciler).
            if (!observed) {
                const created = yield* cloudfront
                    .createOriginRequestPolicy({
                    OriginRequestPolicyConfig: buildConfig(name, news),
                })
                    .pipe(Effect.catchTag("OriginRequestPolicyAlreadyExists", () => getByName(name).pipe(Effect.flatMap((existing) => existing
                    ? Effect.succeed({
                        OriginRequestPolicy: {
                            Id: existing.id,
                            LastModifiedTime: new Date(),
                            OriginRequestPolicyConfig: existing.config,
                        },
                        ETag: existing.etag,
                        Location: undefined,
                    })
                    : Effect.fail(new Error(`Origin request policy '${name}' already exists but could not be recovered`))))));
                if (!created.OriginRequestPolicy?.Id) {
                    return yield* Effect.fail(new Error("createOriginRequestPolicy returned no identifier"));
                }
                yield* session.note(created.OriginRequestPolicy.Id);
                return toAttrs(created.OriginRequestPolicy.Id, created.OriginRequestPolicy.OriginRequestPolicyConfig, created.ETag);
            }
            // Sync — patch the observed config to the desired state. The
            // freshly observed ETag handles optimistic concurrency.
            const updated = yield* cloudfront.updateOriginRequestPolicy({
                Id: observed.id,
                IfMatch: observed.etag,
                OriginRequestPolicyConfig: buildConfig(observed.config.Name, news),
            });
            if (!updated.OriginRequestPolicy?.Id) {
                return yield* Effect.fail(new Error("updateOriginRequestPolicy returned no identifier"));
            }
            yield* session.note(observed.id);
            return toAttrs(updated.OriginRequestPolicy.Id, updated.OriginRequestPolicy.OriginRequestPolicyConfig, updated.ETag);
        }),
        delete: Effect.fn(function* ({ output }) {
            const current = yield* getById(output.originRequestPolicyId);
            if (!current)
                return;
            yield* cloudfront
                .deleteOriginRequestPolicy({
                Id: output.originRequestPolicyId,
                IfMatch: current.etag,
            })
                .pipe(Effect.catchTag("NoSuchOriginRequestPolicy", () => Effect.void));
        }),
    };
}));
const createName = (id, props) => props.name
    ? Effect.succeed(props.name)
    : createPhysicalName({ id, maxLength: 128, lowercase: true });
//# sourceMappingURL=OriginRequestPolicy.js.map