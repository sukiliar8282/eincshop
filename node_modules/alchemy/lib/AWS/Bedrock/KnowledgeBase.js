import * as bedrock from "@distilled.cloud/aws/bedrock-agent";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
/**
 * An Amazon Bedrock knowledge base — a managed RAG index that embeds source
 * documents into a vector store for retrieval.
 *
 * `KnowledgeBase` owns the index configuration; attach one or more
 * {@link DataSource}s (e.g. an S3 bucket) to feed it documents, then trigger
 * ingestion. Query it at runtime with the {@link Retrieve} and
 * {@link RetrieveAndGenerate} bindings, or attach it to an {@link Agent}.
 *
 * The `roleArn` must grant Bedrock access to the embedding model, the vector
 * store, and the source data. The vector store (`storageConfiguration`) must
 * already exist — provision an OpenSearch Serverless collection (with a
 * vector index) or another supported store first.
 *
 * ### Creating Knowledge Bases
 * **Example:** OpenSearch Serverless Backed Knowledge Base
 * ```typescript
 * import * as Bedrock from "alchemy/AWS/Bedrock";
 *
 * const kb = yield* Bedrock.KnowledgeBase("docs", {
 *   roleArn: role.roleArn,
 *   knowledgeBaseConfiguration: {
 *     type: "VECTOR",
 *     vectorKnowledgeBaseConfiguration: {
 *       embeddingModelArn:
 *         "arn:aws:bedrock:us-west-2::foundation-model/amazon.titan-embed-text-v2:0",
 *     },
 *   },
 *   storageConfiguration: {
 *     type: "OPENSEARCH_SERVERLESS",
 *     opensearchServerlessConfiguration: {
 *       collectionArn: collection.arn,
 *       vectorIndexName: "bedrock-index",
 *       fieldMapping: {
 *         vectorField: "bedrock-vector",
 *         textField: "bedrock-text",
 *         metadataField: "bedrock-metadata",
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export const KnowledgeBase = Resource("AWS.Bedrock.KnowledgeBase");
/** KB status values indicating an in-flight transition to wait out. */
const KB_TRANSIENT = new Set(["CREATING", "UPDATING", "DELETING"]);
/**
 * A knowledge base with attached data sources rejects deletion with a
 * `ConflictException` until they are gone (the engine deletes them first, but
 * their teardown is eventually consistent). Bounded retry (~60s), wrapped in
 * an explicitly-typed helper so the `Effect.retry` return type does not widen
 * the provider layer's requirement to `unknown` (see PATTERNS §7).
 */
const retryWhileConflict = (self) => Effect.retry(self, {
    while: (e) => e._tag === "ConflictException",
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(20)]),
});
export const KnowledgeBaseProvider = () => Provider.effect(KnowledgeBase, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.name ?? (yield* createPhysicalName({ id, maxLength: 100 })));
    });
    const getKbOrUndefined = Effect.fn(function* (knowledgeBaseId) {
        return yield* bedrock.getKnowledgeBase({ knowledgeBaseId }).pipe(Effect.map((r) => r.knowledgeBase), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const findByName = Effect.fn(function* (name) {
        const pages = yield* bedrock.listKnowledgeBases
            .pages({})
            .pipe(Stream.runCollect);
        return Array.from(pages)
            .flatMap((page) => page.knowledgeBaseSummaries ?? [])
            .find((s) => s.name === name)?.knowledgeBaseId;
    });
    const fetchObservedTags = Effect.fn(function* (resourceArn) {
        return yield* bedrock.listTagsForResource({ resourceArn }).pipe(Effect.map((r) => (r.tags ?? {})), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({})));
    });
    const waitForSettled = Effect.fn(function* (knowledgeBaseId) {
        return yield* bedrock.getKnowledgeBase({ knowledgeBaseId }).pipe(Effect.map((r) => r.knowledgeBase), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)), Effect.repeat({
            schedule: Schedule.fixed("5 seconds"),
            until: (kb) => kb === undefined || !KB_TRANSIENT.has(kb.status),
            times: 60,
        }));
    });
    return KnowledgeBase.Provider.of({
        stables: ["knowledgeBaseId", "knowledgeBaseArn", "name"],
        list: () => Effect.gen(function* () {
            const pages = yield* bedrock.listKnowledgeBases
                .pages({})
                .pipe(Stream.runCollect);
            const summaries = Array.from(pages).flatMap((page) => page.knowledgeBaseSummaries ?? []);
            const results = yield* Effect.forEach(summaries, (s) => getKbOrUndefined(s.knowledgeBaseId).pipe(Effect.map((kb) => kb === undefined
                ? undefined
                : {
                    knowledgeBaseId: kb.knowledgeBaseId,
                    knowledgeBaseArn: kb.knowledgeBaseArn,
                    name: kb.name,
                    roleArn: kb.roleArn,
                })), { concurrency: 5 });
            return results.filter((r) => r !== undefined);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const kbId = output?.knowledgeBaseId ??
                (yield* findByName(output?.name ??
                    (yield* createName(id, olds ?? {}))));
            if (kbId === undefined)
                return undefined;
            const kb = yield* getKbOrUndefined(kbId);
            if (kb === undefined || kb.status === "DELETING")
                return undefined;
            const attrs = {
                knowledgeBaseId: kb.knowledgeBaseId,
                knowledgeBaseArn: kb.knowledgeBaseArn,
                name: kb.name,
                roleArn: kb.roleArn,
            };
            const tags = yield* fetchObservedTags(kb.knowledgeBaseArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds ?? {});
            const newName = yield* createName(id, news ?? {});
            if (oldName !== newName) {
                return { action: "replace" };
            }
            if ((olds?.knowledgeBaseConfiguration?.type ?? undefined) !==
                (news?.knowledgeBaseConfiguration?.type ?? undefined)) {
                return { action: "replace" };
            }
            // description, role, and tags converge via update.
        }),
        reconcile: Effect.fn(function* ({ id, news = {}, output, session, }) {
            const name = output?.name ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE
            let kb = output?.knowledgeBaseId
                ? yield* getKbOrUndefined(output.knowledgeBaseId)
                : undefined;
            if (kb === undefined) {
                const foundId = yield* findByName(name);
                if (foundId !== undefined) {
                    kb = yield* getKbOrUndefined(foundId);
                }
            }
            if (kb === undefined) {
                // 2. ENSURE
                const created = yield* bedrock.createKnowledgeBase({
                    name,
                    description: news.description,
                    roleArn: news.roleArn,
                    knowledgeBaseConfiguration: news.knowledgeBaseConfiguration,
                    storageConfiguration: news.storageConfiguration,
                    tags: desiredTags,
                });
                kb = created.knowledgeBase;
                kb = (yield* waitForSettled(kb.knowledgeBaseId)) ?? kb;
            }
            else {
                // 3. SYNC — converge mutable settings.
                kb = (yield* waitForSettled(kb.knowledgeBaseId)) ?? kb;
                const drifted = kb.description !== news.description ||
                    kb.roleArn !== news.roleArn ||
                    JSON.stringify(kb.knowledgeBaseConfiguration) !==
                        JSON.stringify(news.knowledgeBaseConfiguration) ||
                    JSON.stringify(kb.storageConfiguration ?? null) !==
                        JSON.stringify(news.storageConfiguration ?? null);
                if (drifted) {
                    yield* bedrock.updateKnowledgeBase({
                        knowledgeBaseId: kb.knowledgeBaseId,
                        name,
                        description: news.description,
                        roleArn: news.roleArn,
                        knowledgeBaseConfiguration: news.knowledgeBaseConfiguration,
                        storageConfiguration: news.storageConfiguration,
                    });
                    kb = (yield* waitForSettled(kb.knowledgeBaseId)) ?? kb;
                }
            }
            const knowledgeBaseId = kb.knowledgeBaseId;
            const knowledgeBaseArn = kb.knowledgeBaseArn;
            // 3b. SYNC TAGS against observed cloud tags.
            const observedTags = yield* fetchObservedTags(knowledgeBaseArn);
            const { upsert, removed } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* bedrock.tagResource({
                    resourceArn: knowledgeBaseArn,
                    tags: Object.fromEntries(upsert.map(({ Key, Value }) => [Key, Value])),
                });
            }
            if (removed.length > 0) {
                yield* bedrock.untagResource({
                    resourceArn: knowledgeBaseArn,
                    tagKeys: removed,
                });
            }
            yield* session.note(knowledgeBaseArn);
            return {
                knowledgeBaseId,
                knowledgeBaseArn,
                name,
                roleArn: news.roleArn,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryWhileConflict(bedrock.deleteKnowledgeBase({
                knowledgeBaseId: output.knowledgeBaseId,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=KnowledgeBase.js.map