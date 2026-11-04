import * as codeconnections from "@distilled.cloud/aws/codeconnections";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { fetchObservedTags, syncResourceTags, toTagList } from "./internal.js";
/**
 * An AWS CodeConnections repository link — associates a connection with a
 * specific external Git repository so Git sync can monitor and sync changes
 * (e.g. CloudFormation git sync).
 *
 * Requires a connection in the `AVAILABLE` state; the connection's OAuth
 * handshake is a one-time **manual** console step.
 * ### Linking a Repository
 * **Example:** Link a GitHub Repository
 * ```typescript
 * const link = yield* CodeConnections.RepositoryLink("Repo", {
 *   connectionArn: connection.connectionArn,
 *   ownerId: "my-github-org",
 *   repositoryName: "my-repo",
 * });
 * ```
 *
 * **Example:** Encrypted Repository Link
 * ```typescript
 * const link = yield* CodeConnections.RepositoryLink("Repo", {
 *   connectionArn: connection.connectionArn,
 *   ownerId: "my-github-org",
 *   repositoryName: "my-repo",
 *   encryptionKeyArn: key.keyArn,
 * });
 * ```
 *
 * @resource
 */
export const RepositoryLink = Resource("AWS.CodeConnections.RepositoryLink");
export const RepositoryLinkProvider = () => Provider.effect(RepositoryLink, Effect.gen(function* () {
    /** Read a repository link by ID; a missing link reads as absent. */
    const getById = Effect.fn(function* (id) {
        const response = yield* codeconnections
            .getRepositoryLink({ RepositoryLinkId: id })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.RepositoryLinkInfo;
    });
    /**
     * Find a repository link by its identity — owner + repository name
     * (getRepositoryLink only accepts an ID).
     */
    const findByIdentity = Effect.fn(function* (ownerId, repositoryName) {
        const links = yield* codeconnections.listRepositoryLinks.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.RepositoryLinks ?? [])));
        return links.find((link) => link.OwnerId === ownerId && link.RepositoryName === repositoryName);
    });
    const toAttrs = (link) => ({
        repositoryLinkId: link.RepositoryLinkId,
        repositoryLinkArn: link.RepositoryLinkArn,
        connectionArn: link.ConnectionArn,
        ownerId: link.OwnerId,
        repositoryName: link.RepositoryName,
        providerType: link.ProviderType ?? "",
        encryptionKeyArn: link.EncryptionKeyArn,
    });
    return {
        stables: [
            "repositoryLinkId",
            "repositoryLinkArn",
            "ownerId",
            "repositoryName",
            "providerType",
        ],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            // The linked repository is the link's identity — replace on change.
            // Connection and encryption key are mutable via UpdateRepositoryLink.
            if ((news?.ownerId ?? undefined) !== (olds?.ownerId ?? undefined) ||
                (news?.repositoryName ?? undefined) !==
                    (olds?.repositoryName ?? undefined)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const link = output?.repositoryLinkId
                ? yield* getById(output.repositoryLinkId)
                : olds?.ownerId && olds?.repositoryName
                    ? yield* findByIdentity(olds.ownerId, olds.repositoryName)
                    : undefined;
            if (link === undefined)
                return undefined;
            const attrs = toAttrs(link);
            const tags = yield* fetchObservedTags(attrs.repositoryLinkArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — cloud state is authoritative.
            let observed = output?.repositoryLinkId
                ? yield* getById(output.repositoryLinkId)
                : yield* findByIdentity(news.ownerId, news.repositoryName);
            // 2. Ensure — create if missing; tolerate the AlreadyExists race.
            if (observed === undefined) {
                observed = yield* codeconnections
                    .createRepositoryLink({
                    ConnectionArn: news.connectionArn,
                    OwnerId: news.ownerId,
                    RepositoryName: news.repositoryName,
                    EncryptionKeyArn: news.encryptionKeyArn,
                    Tags: toTagList(desiredTags),
                })
                    .pipe(Effect.map((res) => res.RepositoryLinkInfo), Effect.catchTag("ResourceAlreadyExistsException", (error) => findByIdentity(news.ownerId, news.repositoryName).pipe(Effect.flatMap((link) => link === undefined
                    ? // The race lost and the winner is not visible yet —
                        // surface the typed conflict; the engine retries.
                        Effect.fail(error)
                    : Effect.succeed(link)))));
            }
            // 3. Sync — connection + encryption key, diffed against OBSERVED
            // cloud state; skip the API entirely on no-op.
            if (observed.ConnectionArn !== news.connectionArn ||
                (observed.EncryptionKeyArn ?? undefined) !==
                    (news.encryptionKeyArn ?? undefined)) {
                const updated = yield* codeconnections.updateRepositoryLink({
                    RepositoryLinkId: observed.RepositoryLinkId,
                    ConnectionArn: news.connectionArn,
                    EncryptionKeyArn: news.encryptionKeyArn,
                });
                observed = updated.RepositoryLinkInfo;
            }
            // 4. Sync tags — diff against OBSERVED cloud tags.
            yield* syncResourceTags(observed.RepositoryLinkArn, desiredTags);
            yield* session.note(`${news.ownerId}/${news.repositoryName}`);
            return toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            // Sync configurations on the link must be deleted first — retry
            // the dependency violation while downstream deletions land.
            yield* codeconnections
                .deleteRepositoryLink({
                RepositoryLinkId: output.repositoryLinkId,
            })
                .pipe(Effect.retry({
                while: (e) => e._tag === "SyncConfigurationStillExistsException",
                schedule: Schedule.exponential("2 seconds"),
                times: 8,
            }), Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
        list: () => codeconnections.listRepositoryLinks.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
            .flatMap((page) => page.RepositoryLinks ?? [])
            .map((link) => ({
            repositoryLinkId: link.RepositoryLinkId,
            repositoryLinkArn: link.RepositoryLinkArn,
            connectionArn: link.ConnectionArn,
            ownerId: link.OwnerId,
            repositoryName: link.RepositoryName,
            providerType: link.ProviderType ?? "",
            encryptionKeyArn: link.EncryptionKeyArn,
        })))),
    };
}));
//# sourceMappingURL=RepositoryLink.js.map