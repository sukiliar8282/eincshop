import * as kms from "@distilled.cloud/aws/kms";
import * as ssm from "@distilled.cloud/aws/ssm";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags, hasAlchemyTags, } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * An AWS Systems Manager (SSM) Parameter Store parameter.
 *
 * `Parameter` owns the lifecycle of a `String`, `StringList`, or
 * `SecureString` parameter. A parameter name is auto-generated from the app,
 * stage, and logical ID unless you provide one explicitly. Standard-tier
 * parameters are free, making them ideal for configuration values, feature
 * flags, and small secrets.
 * ### Creating Parameters
 * **Example:** String Parameter
 * ```typescript
 * import * as SSM from "alchemy/AWS/SSM";
 *
 * const config = yield* SSM.Parameter("DatabaseUrl", {
 *   value: "postgres://db.example.com:5432/app",
 * });
 * ```
 *
 * **Example:** StringList Parameter
 * ```typescript
 * const subnets = yield* SSM.Parameter("AllowedOrigins", {
 *   type: "StringList",
 *   value: "https://a.example.com,https://b.example.com",
 * });
 * ```
 *
 * **Example:** Parameter with a Hierarchical Name
 * ```typescript
 * const param = yield* SSM.Parameter("DbUrl", {
 *   name: "/my-app/prod/db-url",
 *   value: "postgres://db.example.com:5432/app",
 * });
 * ```
 *
 * ### SecureString Parameters
 * **Example:** Encrypted with the AWS-managed key
 * ```typescript
 * import * as Redacted from "effect/Redacted";
 *
 * const apiKey = yield* SSM.Parameter("ApiKey", {
 *   type: "SecureString",
 *   value: Redacted.make("super-secret-value"),
 * });
 * ```
 *
 * **Example:** Encrypted with a customer-managed KMS key
 * ```typescript
 * const key = yield* KMS.Key("SecretsKey");
 * const apiKey = yield* SSM.Parameter("ApiKey", {
 *   type: "SecureString",
 *   value: Redacted.make("super-secret-value"),
 *   keyId: key.keyId,
 * });
 * ```
 *
 * ### Validation
 * **Example:** Constrain values with an allowed pattern
 * ```typescript
 * const port = yield* SSM.Parameter("Port", {
 *   value: "5432",
 *   allowedPattern: "^\\d+$",
 * });
 * ```
 *
 * ### Reading Parameters at Runtime
 * Bind read operations in the init phase and use them in runtime handlers.
 *
 * **Example:** Read a parameter from a handler
 * ```typescript
 * // init
 * const getParameter = yield* SSM.GetParameter(config);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     const result = yield* getParameter({ WithDecryption: true });
 *     return HttpServerResponse.text(String(result.Parameter?.Value));
 *   }),
 * };
 * ```
 *
 * @resource
 */
export const Parameter = Resource("AWS.SSM.Parameter");
/** Normalize a plain or redacted parameter value to its plain string. */
const toPlainValue = (value) => value === undefined
    ? undefined
    : typeof value === "string"
        ? value
        : Redacted.value(value);
const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => typeof tag.Key === "string" && typeof tag.Value === "string")
    .map((tag) => [tag.Key, tag.Value]));
const parameterArnOf = (region, accountId, name) => `arn:aws:ssm:${region}:${accountId}:parameter${name.startsWith("/") ? "" : "/"}${name}`;
export const ParameterProvider = () => Provider.effect(Parameter, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        if (props.name)
            return props.name;
        const generated = yield* createPhysicalName({ id, maxLength: 128 });
        // SSM rejects parameter names prefixed with "aws" or "ssm"
        // (case-insensitive) with a ValidationException. Stack names like
        // "SSMBindings" would otherwise produce invalid physical names, so
        // deterministically prefix those.
        return /^(aws|ssm)/i.test(generated) ? `p-${generated}` : generated;
    });
    // DescribeParameters is the only API that surfaces tier, description,
    // allowedPattern, and the KMS key id. It is eventually consistent, so
    // treat an absent result as "no metadata yet" rather than "missing".
    const describeByName = Effect.fn(function* (name) {
        return yield* ssm.describeParameters
            .pages({
            ParameterFilters: [
                { Key: "Name", Option: "Equals", Values: [name] },
            ],
        })
            .pipe(Stream.map((page) => page.Parameters ?? []), Stream.flattenIterable, Stream.runHead, Effect.map(Option.getOrUndefined));
    });
    // Resolve a key id/alias/ARN to the key ARN for the `keyArn` attribute.
    // The AWS-managed `alias/aws/ssm` key is created lazily on first use,
    // so tolerate NotFound as "not resolvable yet".
    const resolveKeyArn = Effect.fn(function* (keyId) {
        return yield* kms.describeKey({ KeyId: keyId ?? "alias/aws/ssm" }).pipe(Effect.map((r) => r.KeyMetadata?.Arn), Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    });
    const fetchObservedTags = Effect.fn(function* (name) {
        return yield* ssm
            .listTagsForResource({ ResourceType: "Parameter", ResourceId: name })
            .pipe(Effect.map((r) => toTagRecord(r.TagList)), 
        // A just-created (or just-deleted) parameter can transiently
        // surface InvalidResourceId; treat as "no tags observed".
        Effect.catchTag("InvalidResourceId", () => Effect.succeed({})));
    });
    return Parameter.Provider.of({
        stables: ["parameterName", "parameterArn"],
        list: () => Effect.gen(function* () {
            const { accountId, region } = yield* AWSEnvironment.current;
            const pages = yield* ssm.describeParameters
                .pages({})
                .pipe(Stream.runCollect);
            const metas = Array.from(pages).flatMap((page) => page.Parameters ?? []);
            return yield* Effect.forEach(metas.filter((m) => m.Name != null), (m) => Effect.gen(function* () {
                const type = (m.Type ?? "String");
                const keyArn = type === "SecureString"
                    ? yield* resolveKeyArn(m.KeyId).pipe(Effect.catch(() => Effect.succeed(undefined)))
                    : undefined;
                return {
                    parameterName: m.Name,
                    parameterArn: m.ARN ?? parameterArnOf(region, accountId, m.Name),
                    type,
                    version: m.Version ?? 1,
                    keyArn,
                };
            }), { concurrency: 5 });
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.parameterName ?? (yield* createName(id, olds ?? {}));
            const found = yield* ssm.getParameter({ Name: name }).pipe(Effect.map((r) => r.Parameter), Effect.catchTag("ParameterNotFound", () => Effect.succeed(undefined)));
            if (!found)
                return undefined;
            const type = (found.Type ?? "String");
            const meta = yield* describeByName(name).pipe(Effect.catch(() => Effect.succeed(undefined)));
            const keyArn = type === "SecureString"
                ? yield* resolveKeyArn(meta?.KeyId).pipe(Effect.catch(() => Effect.succeed(undefined)))
                : undefined;
            const attrs = {
                parameterName: name,
                parameterArn: found.ARN ?? parameterArnOf(region, accountId, name),
                type,
                version: found.Version ?? 1,
                keyArn,
            };
            const tags = yield* fetchObservedTags(name).pipe(Effect.catch(() => Effect.succeed({})));
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
            // The API cannot downgrade an Advanced parameter back to Standard —
            // the only way to converge is delete + recreate.
            const oldTier = olds?.tier ?? "Standard";
            const newTier = news?.tier ?? "Standard";
            if (oldTier === "Advanced" && newTier === "Standard") {
                return { action: "replace" };
            }
            // Type changes (String <-> SecureString etc.) are mutable via
            // PutParameter Overwrite=true, so fall through to default update.
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.parameterName ?? (yield* createName(id, news));
            const parameterArn = parameterArnOf(region, accountId, name);
            const desiredType = news.type ?? "String";
            const desiredValue = toPlainValue(news.value);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE — cloud state is authoritative. `output` is only a
            //    cache of the physical name; if the parameter was deleted
            //    out-of-band we fall through to create.
            const observed = yield* ssm
                .getParameter({ Name: name, WithDecryption: true })
                .pipe(Effect.map((r) => r.Parameter), Effect.catchTag("ParameterNotFound", () => Effect.succeed(undefined)));
            let version;
            if (observed === undefined) {
                // 2. ENSURE — create with tags in one call. PutParameter rejects
                //    Tags together with Overwrite, so if a concurrent reconciler
                //    won the race we fall back to an overwrite put (the tag sync
                //    below converges tags).
                version = yield* ssm
                    .putParameter({
                    Name: name,
                    Value: news.value,
                    Type: desiredType,
                    Description: news.description,
                    KeyId: news.keyId,
                    AllowedPattern: news.allowedPattern,
                    Tier: news.tier,
                    DataType: news.dataType,
                    Tags: createTagsList(desiredTags),
                })
                    .pipe(Effect.map((r) => r.Version), Effect.catchTag("ParameterAlreadyExists", () => ssm
                    .putParameter({
                    Name: name,
                    Value: news.value,
                    Type: desiredType,
                    Description: news.description,
                    KeyId: news.keyId,
                    AllowedPattern: news.allowedPattern,
                    Tier: news.tier,
                    DataType: news.dataType,
                    Overwrite: true,
                })
                    .pipe(Effect.map((r) => r.Version))));
            }
            else {
                // 3. SYNC — diff observed cloud state against desired and only
                //    call PutParameter when something actually drifted.
                //    DescribeParameters carries the metadata GetParameter omits
                //    (tier, description, allowedPattern, KMS key id); it is
                //    eventually consistent so an absent record just means "can't
                //    prove a no-op" and we overwrite.
                const meta = yield* describeByName(name).pipe(Effect.catch(() => Effect.succeed(undefined)));
                const drift = toPlainValue(observed.Value) !== desiredValue ||
                    (observed.Type ?? "String") !== desiredType ||
                    (news.description !== undefined &&
                        meta?.Description !== news.description) ||
                    (news.allowedPattern !== undefined &&
                        meta?.AllowedPattern !== news.allowedPattern) ||
                    (news.tier !== undefined && meta?.Tier !== news.tier) ||
                    (news.dataType !== undefined &&
                        (meta?.DataType ?? "text") !== news.dataType) ||
                    (desiredType === "SecureString" &&
                        news.keyId !== undefined &&
                        meta?.KeyId !== news.keyId);
                if (drift) {
                    version = yield* ssm
                        .putParameter({
                        Name: name,
                        Value: news.value,
                        Type: desiredType,
                        Description: news.description,
                        KeyId: news.keyId,
                        AllowedPattern: news.allowedPattern,
                        Tier: news.tier,
                        DataType: news.dataType,
                        Overwrite: true,
                    })
                        .pipe(Effect.map((r) => r.Version));
                }
                else {
                    version = observed.Version;
                }
            }
            // 3b. SYNC TAGS — diff against OBSERVED cloud tags (never olds or
            //     output) so adoption converges. Internal Alchemy tags always
            //     win over user tags.
            const observedTags = yield* fetchObservedTags(name);
            const { upsert, removed } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* ssm
                    .addTagsToResource({
                    ResourceType: "Parameter",
                    ResourceId: name,
                    Tags: upsert,
                })
                    .pipe(Effect.retry({
                    while: (e) => e._tag === "TooManyUpdates" ||
                        e._tag === "InvalidResourceId",
                    schedule: Schedule.max([
                        Schedule.fixed(1000),
                        Schedule.recurs(5),
                    ]),
                }));
            }
            if (removed.length > 0) {
                yield* ssm
                    .removeTagsFromResource({
                    ResourceType: "Parameter",
                    ResourceId: name,
                    TagKeys: removed,
                })
                    .pipe(Effect.retry({
                    while: (e) => e._tag === "TooManyUpdates",
                    schedule: Schedule.max([
                        Schedule.fixed(1000),
                        Schedule.recurs(5),
                    ]),
                }));
            }
            // 4. RETURN — resolve the encryption key ARN after the put so a
            //    first SecureString write has already materialized the
            //    AWS-managed alias/aws/ssm key.
            const keyArn = desiredType === "SecureString"
                ? yield* resolveKeyArn(news.keyId)
                : undefined;
            yield* session.note(parameterArn);
            return {
                parameterName: name,
                parameterArn,
                type: desiredType,
                version: version ?? 1,
                keyArn,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* ssm
                .deleteParameter({ Name: output.parameterName })
                .pipe(Effect.catchTag("ParameterNotFound", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Parameter.js.map