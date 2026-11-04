import * as organizations from "@distilled.cloud/aws/organizations";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { collectPages, readResourceTags, retryOrganizations, updateResourceTags, } from "./common.js";
/**
 * The organization root.
 *
 * `Root` is an import-style resource. It discovers the existing root returned by
 * AWS Organizations and can reconcile root tags. Use `root.rootId` as the
 * `parentId` for top-level {@link OrganizationalUnit}s and {@link Account}s,
 * and as the `targetId`/`rootId` for {@link PolicyAttachment} and
 * {@link RootPolicyType}.
 * ### Importing the Root
 * **Example:** Adopt the Organization Root
 * ```typescript
 * const organization = yield* Organization("Org", { featureSet: "ALL" });
 * const root = yield* Root("Root", {});
 * ```
 *
 * **Example:** Parent OUs and Accounts Under the Root
 * ```typescript
 * const workloads = yield* OrganizationalUnit("Workloads", {
 *   parentId: root.rootId,
 *   name: "workloads",
 * });
 *
 * const sandbox = yield* Account("Sandbox", {
 *   name: "sandbox",
 *   email: "aws-sandbox@example.com",
 *   parentId: root.rootId,
 * });
 * ```
 *
 * @resource
 */
export const Root = Resource("AWS.Organizations.Root");
export const RootProvider = () => Provider.effect(Root, Effect.gen(function* () {
    return {
        stables: ["rootId", "rootArn"],
        // Enumerate every organization root via `listRoots` (paginated) and
        // hydrate each into the exact `read` Attributes shape, fetching tags
        // with bounded concurrency. Degrades to `[]` when the caller isn't an
        // organization management account (the account isn't in an org, or
        // lacks Organizations permissions) via the typed catches below.
        list: () => Effect.gen(function* () {
            const roots = yield* retryOrganizations(organizations.listRoots.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.Roots ?? [])))).pipe(Effect.catchTags({
                AWSOrganizationsNotInUseException: () => Effect.succeed([]),
                AccessDeniedException: () => Effect.succeed([]),
            }));
            const valid = roots.filter((root) => root.Id != null && root.Arn != null && root.Name != null);
            const attrs = yield* Effect.forEach(valid, Effect.fn(function* (root) {
                if (!root.Id || !root.Arn || !root.Name)
                    return undefined;
                const tags = yield* readResourceTags(root.Id).pipe(Effect.catchTag("TargetNotFoundException", () => Effect.succeed({})));
                return {
                    rootId: root.Id,
                    rootArn: root.Arn,
                    rootName: root.Name,
                    policyTypes: root.PolicyTypes ?? [],
                    tags,
                };
            }), { concurrency: 10 });
            return attrs.filter((attr) => attr !== undefined);
        }),
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return;
            if (olds?.rootId !== news?.rootId) {
                return { action: "replace" };
            }
            if (olds?.name !== news?.name) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            return yield* readRoot({
                rootId: output?.rootId ?? olds?.rootId,
                name: olds?.name,
            });
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            // Observe — discover the live root. `Root` is import-only: AWS
            // creates the root for us when the organization is created, and we
            // never create or delete it. We always look it up fresh.
            const root = yield* readRoot({
                rootId: output?.rootId ?? news.rootId,
                name: news.name,
            });
            if (!root) {
                return yield* Effect.fail(new Error(output?.rootId
                    ? `organization root '${output.rootId}' not found`
                    : "organization root not found"));
            }
            // Sync tags — diff observed cloud tags against desired. Using
            // `root.tags` as the baseline (instead of stale `olds.tags`) keeps
            // the reconciler convergent even on adoption or after drift.
            const tags = yield* updateResourceTags({
                id,
                resourceId: root.rootId,
                olds: root.tags,
                news: news.tags,
            });
            yield* session.note(root.rootArn);
            return {
                ...root,
                tags,
            };
        }),
        delete: Effect.fn(function* () { }),
    };
}));
const listRoots = () => collectPages((NextToken) => organizations.listRoots({ NextToken }), (page) => page.Roots);
const readRoot = Effect.fn(function* ({ rootId, name, }) {
    const roots = yield* retryOrganizations(listRoots());
    const root = roots.find((candidate) => (rootId ? candidate.Id === rootId : true) &&
        (name ? candidate.Name === name : true));
    if (!root?.Id || !root.Arn || !root.Name) {
        return undefined;
    }
    const tags = yield* readResourceTags(root.Id).pipe(Effect.catchTag("TargetNotFoundException", () => Effect.succeed({})));
    return {
        rootId: root.Id,
        rootArn: root.Arn,
        rootName: root.Name,
        policyTypes: root.PolicyTypes ?? [],
        tags,
    };
});
//# sourceMappingURL=Root.js.map