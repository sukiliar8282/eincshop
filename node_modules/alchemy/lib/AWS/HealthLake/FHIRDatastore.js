import * as healthlake from "@distilled.cloud/aws/healthlake";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
/**
 * An AWS HealthLake FHIR-enabled data store — a HIPAA-eligible, managed
 * store for FHIR R4 health data with a FHIR REST endpoint plus bulk
 * import/export.
 *
 * Data stores take roughly 15-30 minutes to provision (`CREATING` →
 * `ACTIVE`) and are billed while they exist; deletion is also asynchronous
 * (`DELETING` → gone). Destroy data stores you are not using.
 * ### Creating a Data Store
 * **Example:** Basic FHIR R4 Data Store
 * ```typescript
 * const datastore = yield* FHIRDatastore("Records", {});
 * ```
 *
 * **Example:** Data Store Preloaded with Synthetic Data
 * ```typescript
 * const datastore = yield* FHIRDatastore("Sandbox", {
 *   preloadDataType: "SYNTHEA",
 * });
 * ```
 *
 * ### Encryption
 * **Example:** Data Store Encrypted with a Customer-Managed KMS Key
 * ```typescript
 * const key = yield* KMS.Key("RecordsKey", {
 *   description: "healthlake data store key",
 * });
 * const datastore = yield* FHIRDatastore("Records", {
 *   kmsKeyId: key.keyArn,
 * });
 * ```
 *
 * @resource
 */
export const FHIRDatastore = Resource("AWS.HealthLake.FHIRDatastore");
const DEFAULT_FHIR_VERSION = "R4";
const toIdpConfig = (props) => props === undefined
    ? undefined
    : {
        AuthorizationStrategy: props.authorizationStrategy,
        FineGrainedAuthorizationEnabled: props.fineGrainedAuthorizationEnabled,
        Metadata: props.metadata,
        IdpLambdaArn: props.idpLambdaArn,
    };
const sameIdpConfig = (observed, desired) => observed !== undefined &&
    observed.AuthorizationStrategy === desired.AuthorizationStrategy &&
    (observed.FineGrainedAuthorizationEnabled ?? false) ===
        (desired.FineGrainedAuthorizationEnabled ?? false) &&
    observed.Metadata === desired.Metadata &&
    observed.IdpLambdaArn === desired.IdpLambdaArn;
export const FHIRDatastoreProvider = () => Provider.effect(FHIRDatastore, Effect.gen(function* () {
    const toName = (id, props) => props.datastoreName
        ? Effect.succeed(props.datastoreName)
        : createPhysicalName({ id, maxLength: 256 });
    const readDatastoreTags = Effect.fn(function* (arn) {
        const response = yield* healthlake
            .listTagsForResource({ ResourceARN: arn })
            .pipe(Effect.catch(() => Effect.succeed({ Tags: [] })));
        const tags = {};
        for (const tag of response.Tags ?? []) {
            tags[tag.Key] = tag.Value;
        }
        return tags;
    });
    // Describe by id; typed not-found → undefined. A data store in
    // DELETED status still describes for a while — callers decide how to
    // treat terminal/transitional statuses.
    const readDatastore = Effect.fn(function* (datastoreId) {
        const response = yield* healthlake
            .describeFHIRDatastore({ DatastoreId: datastoreId })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.DatastoreProperties;
    });
    const isGoneOrGoing = (properties) => properties === undefined ||
        properties.DatastoreStatus === "DELETED" ||
        properties.DatastoreStatus === "DELETING";
    // Data store ids are auto-assigned; recover an existing instance from
    // its deterministic name (bounded pagination, name-filtered).
    const findByName = Effect.fn(function* (name) {
        let nextToken;
        for (let page = 0; page < 20; page++) {
            const response = yield* healthlake.listFHIRDatastores({
                Filter: { DatastoreName: name },
                NextToken: nextToken,
            });
            const match = (response.DatastorePropertiesList ?? []).find((properties) => !isGoneOrGoing(properties));
            if (match !== undefined)
                return match;
            nextToken = response.NextToken;
            if (!nextToken)
                break;
        }
        return undefined;
    });
    // Bounded readiness wait. Provisioning typically completes in 15-30
    // minutes; budget ~35 min (70 * 30s). Terminal failure statuses stop
    // the wait immediately.
    const waitForActive = Effect.fn(function* (datastoreId) {
        const properties = yield* readDatastore(datastoreId).pipe(Effect.repeat({
            schedule: Schedule.max([
                Schedule.fixed("30 seconds"),
                Schedule.recurs(70),
            ]),
            until: (p) => p === undefined ||
                p.DatastoreStatus === "ACTIVE" ||
                p.DatastoreStatus === "CREATE_FAILED" ||
                p.DatastoreStatus === "UPDATE_FAILED" ||
                p.DatastoreStatus === "DELETED",
        }));
        if (properties === undefined ||
            properties.DatastoreStatus !== "ACTIVE") {
            const cause = properties?.ErrorCause?.ErrorMessage;
            return yield* Effect.fail(new Error(`HealthLake data store '${datastoreId}' did not become ACTIVE (status: ${properties?.DatastoreStatus ?? "gone"}${cause ? `: ${cause}` : ""})`));
        }
        return properties;
    });
    // Wait for a data store to leave a transitional state (CREATING /
    // UPDATING) so delete does not hit ConflictException.
    const waitUntilSettled = Effect.fn(function* (datastoreId) {
        return yield* readDatastore(datastoreId).pipe(Effect.repeat({
            schedule: Schedule.max([
                Schedule.fixed("30 seconds"),
                Schedule.recurs(70),
            ]),
            until: (p) => p === undefined ||
                (p.DatastoreStatus !== "CREATING" &&
                    p.DatastoreStatus !== "UPDATING"),
        }));
    });
    // Deletion is asynchronous (DELETING → gone); wait until the data
    // store is fully gone. Budget ~35 min (70 * 30s).
    const waitUntilGone = Effect.fn(function* (datastoreId) {
        const properties = yield* readDatastore(datastoreId).pipe(Effect.repeat({
            schedule: Schedule.max([
                Schedule.fixed("30 seconds"),
                Schedule.recurs(70),
            ]),
            until: (p) => p === undefined || p.DatastoreStatus === "DELETED",
        }));
        if (properties !== undefined &&
            properties.DatastoreStatus !== "DELETED") {
            return yield* Effect.fail(new Error(`HealthLake data store '${datastoreId}' still exists after deletion (status: ${properties.DatastoreStatus})`));
        }
    });
    const toAttrs = Effect.fn(function* (properties) {
        return {
            datastoreId: properties.DatastoreId,
            datastoreArn: properties.DatastoreArn,
            datastoreName: properties.DatastoreName ?? "",
            datastoreStatus: properties.DatastoreStatus,
            datastoreEndpoint: properties.DatastoreEndpoint,
            datastoreTypeVersion: properties.DatastoreTypeVersion,
            tags: yield* readDatastoreTags(properties.DatastoreArn),
        };
    });
    return {
        stables: [
            "datastoreId",
            "datastoreArn",
            "datastoreEndpoint",
            "datastoreTypeVersion",
        ],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            const n = news ?? {};
            const o = olds ?? {};
            // Create-only properties force a replacement.
            if ((n.datastoreTypeVersion ?? DEFAULT_FHIR_VERSION) !==
                (o.datastoreTypeVersion ?? DEFAULT_FHIR_VERSION)) {
                return { action: "replace" };
            }
            if (n.kmsKeyId !== o.kmsKeyId) {
                return { action: "replace" };
            }
            if (n.preloadDataType !== o.preloadDataType) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            let properties = output?.datastoreId
                ? yield* readDatastore(output.datastoreId)
                : undefined;
            if (isGoneOrGoing(properties)) {
                const name = yield* toName(id, olds ?? {});
                properties = yield* findByName(name);
            }
            if (properties === undefined)
                return undefined;
            const attrs = yield* toAttrs(properties);
            return (yield* hasAlchemyTags(id, attrs.tags))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const props = news;
            const name = yield* toName(id, props);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...props.tags };
            // 1. Observe — cloud state is authoritative; output is only an
            //    id cache. A deleted/deleting instance is treated as missing.
            let observed = output?.datastoreId
                ? yield* readDatastore(output.datastoreId)
                : undefined;
            if (isGoneOrGoing(observed)) {
                observed = yield* findByName(name);
            }
            // 2. Ensure — create if missing, then wait (bounded) for ACTIVE.
            //    ClientToken is an idempotency token filled in by distilled.
            if (observed === undefined) {
                const created = yield* healthlake.createFHIRDatastore({
                    DatastoreName: name,
                    DatastoreTypeVersion: props.datastoreTypeVersion ?? DEFAULT_FHIR_VERSION,
                    SseConfiguration: props.kmsKeyId
                        ? {
                            KmsEncryptionConfig: {
                                CmkType: "CUSTOMER_MANAGED_KMS_KEY",
                                KmsKeyId: props.kmsKeyId,
                            },
                        }
                        : undefined,
                    PreloadDataConfig: props.preloadDataType
                        ? { PreloadDataType: props.preloadDataType }
                        : undefined,
                    IdentityProviderConfiguration: toIdpConfig(props.identityProviderConfiguration),
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                });
                observed = yield* waitForActive(created.DatastoreId);
            }
            else if (observed.DatastoreStatus !== "ACTIVE") {
                // Mid-flight provisioning or a prior update still converging.
                observed = yield* waitForActive(observed.DatastoreId);
            }
            // 3. Sync mutable aspects — compute the update delta from
            //    OBSERVED state; skip the API entirely on no-op.
            const update = {
                DatastoreId: observed.DatastoreId,
            };
            let mutated = false;
            if (observed.DatastoreName !== name) {
                update.DatastoreName = name;
                mutated = true;
            }
            const desiredIdp = toIdpConfig(props.identityProviderConfiguration);
            if (desiredIdp !== undefined &&
                !sameIdpConfig(observed.IdentityProviderConfiguration, desiredIdp)) {
                update.IdentityProviderConfiguration = desiredIdp;
                mutated = true;
            }
            if (mutated) {
                yield* healthlake.updateFHIRDatastore(update);
                observed = yield* waitForActive(observed.DatastoreId);
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            const observedTags = yield* readDatastoreTags(observed.DatastoreArn);
            const { removed, upsert } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* healthlake.tagResource({
                    ResourceARN: observed.DatastoreArn,
                    Tags: upsert,
                });
            }
            if (removed.length > 0) {
                yield* healthlake.untagResource({
                    ResourceARN: observed.DatastoreArn,
                    TagKeys: removed,
                });
            }
            yield* session.note(observed.DatastoreId);
            return yield* toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            const datastoreId = output.datastoreId;
            // A data store mid-create/update rejects deletion with
            // ConflictException — wait (bounded) for it to settle first.
            const settled = yield* waitUntilSettled(datastoreId).pipe(Effect.catch(() => Effect.succeed(undefined)));
            if (settled === undefined || settled.DatastoreStatus === "DELETED") {
                return;
            }
            if (settled.DatastoreStatus !== "DELETING") {
                yield* healthlake
                    .deleteFHIRDatastore({ DatastoreId: datastoreId })
                    .pipe(Effect.retry({
                    while: (e) => e._tag === "ConflictException",
                    schedule: Schedule.max([
                        Schedule.fixed("15 seconds"),
                        Schedule.recurs(10),
                    ]),
                }), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            }
            // Deletion is asynchronous — wait until the data store is gone so
            // dependent resources (e.g. the KMS key) can be deleted next.
            yield* waitUntilGone(datastoreId);
        }),
        list: () => Effect.gen(function* () {
            // Bounded hand-rolled pagination.
            const datastores = [];
            let nextToken;
            for (let page = 0; page < 20; page++) {
                const response = yield* healthlake.listFHIRDatastores({
                    NextToken: nextToken,
                });
                datastores.push(...(response.DatastorePropertiesList ?? []));
                nextToken = response.NextToken;
                if (!nextToken)
                    break;
            }
            return yield* Effect.forEach(datastores.filter((properties) => !isGoneOrGoing(properties)), (properties) => toAttrs(properties), { concurrency: 4 });
        }),
    };
}));
//# sourceMappingURL=FHIRDatastore.js.map