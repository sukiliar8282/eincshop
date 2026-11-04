import * as dms from "@distilled.cloud/aws/database-migration-service";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
/**
 * An AWS Database Migration Service (DMS) endpoint — the source or target
 * database of a replication. Endpoints are metadata-only (they store
 * connection information, not data), so they are free and fast to create.
 * ### Creating Endpoints
 * **Example:** MySQL Source Endpoint
 * ```typescript
 * const source = yield* Endpoint("Source", {
 *   endpointType: "source",
 *   engineName: "mysql",
 *   serverName: "source-db.example.com",
 *   port: 3306,
 *   username: "admin",
 *   password: Redacted.make("super-secret"),
 *   databaseName: "app",
 * });
 * ```
 *
 * **Example:** S3 Target Endpoint
 * ```typescript
 * const target = yield* Endpoint("Target", {
 *   endpointType: "target",
 *   engineName: "s3",
 *   serviceAccessRoleArn: role.roleArn,
 *   s3Settings: {
 *     BucketName: bucket.bucketName,
 *     ServiceAccessRoleArn: role.roleArn,
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Endpoint = Resource("AWS.DMS.Endpoint");
const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => typeof tag.Key === "string" && typeof tag.Value === "string")
    .map((tag) => [tag.Key, tag.Value]));
export const EndpointProvider = () => Provider.effect(Endpoint, Effect.gen(function* () {
    const toName = (id, props) => props.endpointIdentifier
        ? Effect.succeed(props.endpointIdentifier)
        : createPhysicalName({ id, maxLength: 200, lowercase: true });
    // DMS has no get-by-identifier; describeEndpoints with an `endpoint-id`
    // filter returns the single matching endpoint (or ResourceNotFoundFault).
    const findEndpoint = Effect.fn(function* (identifier) {
        const response = yield* dms
            .describeEndpoints({
            Filters: [{ Name: "endpoint-id", Values: [identifier] }],
        })
            .pipe(Effect.catchTag("ResourceNotFoundFault", () => Effect.succeed(undefined)));
        return response?.Endpoints?.[0];
    });
    const readTags = Effect.fn(function* (arn) {
        const response = yield* dms
            .listTagsForResource({ ResourceArn: arn })
            .pipe(Effect.catch(() => Effect.succeed(undefined)));
        return toTagRecord(response?.TagList);
    });
    const toAttrs = Effect.fn(function* (endpoint) {
        if (!endpoint.EndpointIdentifier || !endpoint.EndpointArn) {
            return yield* Effect.fail(new Error(`DMS endpoint '${endpoint.EndpointIdentifier}' is missing its identifier or ARN`));
        }
        return {
            endpointIdentifier: endpoint.EndpointIdentifier,
            endpointArn: endpoint.EndpointArn,
            endpointType: endpoint.EndpointType ?? "source",
            engineName: endpoint.EngineName ?? "",
            status: endpoint.Status,
            tags: yield* readTags(endpoint.EndpointArn),
        };
    });
    // Settings blocks and secret material shared by create + modify.
    const buildSettings = (props) => ({
        Username: props.username,
        Password: props.password,
        ServerName: props.serverName,
        Port: props.port,
        DatabaseName: props.databaseName,
        ExtraConnectionAttributes: props.extraConnectionAttributes,
        CertificateArn: props.certificateArn,
        SslMode: props.sslMode,
        ServiceAccessRoleArn: props.serviceAccessRoleArn,
        ExternalTableDefinition: props.externalTableDefinition,
        S3Settings: props.s3Settings,
        DynamoDbSettings: props.dynamoDbSettings,
        KinesisSettings: props.kinesisSettings,
        KafkaSettings: props.kafkaSettings,
        ElasticsearchSettings: props.elasticsearchSettings,
        NeptuneSettings: props.neptuneSettings,
        RedshiftSettings: props.redshiftSettings,
        PostgreSQLSettings: props.postgreSQLSettings,
        MySQLSettings: props.mySQLSettings,
        OracleSettings: props.oracleSettings,
        MicrosoftSQLServerSettings: props.microsoftSQLServerSettings,
        MongoDbSettings: props.mongoDbSettings,
        DocDbSettings: props.docDbSettings,
        RedisSettings: props.redisSettings,
    });
    return {
        stables: ["endpointIdentifier", "endpointArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds ?? {})) !==
                (yield* toName(id, news))) {
                return { action: "replace" };
            }
            // KMS key is create-only.
            if ((news.kmsKeyId ?? undefined) !== (olds?.kmsKeyId ?? undefined)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.endpointIdentifier ??
                (yield* toName(id, olds ?? {}));
            const endpoint = yield* findEndpoint(name);
            if (!endpoint?.EndpointArn)
                return undefined;
            const attrs = yield* toAttrs(endpoint);
            return (yield* hasAlchemyTags(id, attrs.tags))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.endpointIdentifier ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — cloud state is authoritative.
            let observed = yield* findEndpoint(name);
            // 2. Ensure — create if missing; tolerate AlreadyExists as a race.
            if (observed === undefined) {
                observed = yield* dms
                    .createEndpoint({
                    EndpointIdentifier: name,
                    EndpointType: news.endpointType,
                    EngineName: news.engineName,
                    KmsKeyId: news.kmsKeyId,
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                    ...buildSettings(news),
                })
                    .pipe(Effect.map((r) => r.Endpoint), Effect.catchTag("ResourceAlreadyExistsFault", () => findEndpoint(name)));
            }
            else {
                // 3. Sync — the endpoint exists; push desired configuration. DMS
                //    modifyEndpoint is a full upsert of the connection settings,
                //    so send them all (cheap, no delta computation needed).
                observed = yield* dms
                    .modifyEndpoint({
                    EndpointArn: observed.EndpointArn,
                    EndpointIdentifier: name,
                    EndpointType: news.endpointType,
                    EngineName: news.engineName,
                    ...buildSettings(news),
                })
                    .pipe(Effect.map((r) => r.Endpoint));
            }
            if (!observed?.EndpointArn) {
                return yield* Effect.fail(new Error(`DMS endpoint '${name}' has no ARN after reconcile`));
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            const arn = observed.EndpointArn;
            const observedTags = yield* readTags(arn);
            const { upsert, removed } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* dms.addTagsToResource({ ResourceArn: arn, Tags: upsert });
            }
            if (removed.length > 0) {
                yield* dms.removeTagsFromResource({
                    ResourceArn: arn,
                    TagKeys: removed,
                });
            }
            yield* session.note(name);
            return yield* toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* dms
                .deleteEndpoint({ EndpointArn: output.endpointArn })
                .pipe(Effect.catchTag("ResourceNotFoundFault", () => Effect.void));
        }),
        list: () => dms.describeEndpoints.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.Endpoints ?? []).filter((endpoint) => endpoint.EndpointIdentifier !== undefined &&
            endpoint.EndpointArn !== undefined))), Effect.flatMap(Effect.forEach((endpoint) => toAttrs(endpoint), {
            concurrency: 4,
        }))),
    };
}));
//# sourceMappingURL=Endpoint.js.map