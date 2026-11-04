import * as schemaValidation from "@distilled.cloud/cloudflare/schema-validation";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.SchemaValidation.Schema";
/**
 * An OpenAPI v3 schema uploaded to a zone for API Shield schema validation
 * (`/zones/{zone_id}/schema_validation/schemas`).
 *
 * Uploading a schema registers the endpoints it describes as API Shield
 * operations (a server-side side effect — deleting the schema does not
 * delete those operations). The schema body is immutable: changing `source`
 * uploads a new schema and deletes the old one (replacement). Only the
 * `validationEnabled` flag is mutable in place.
 * ### Uploading a Schema
 * **Example:** Upload an OpenAPI v3 schema
 * ```typescript
 * const schema = yield* Cloudflare.SchemaValidation.SchemaValidationSchema("ApiSchema", {
 *   zoneId: zone.zoneId,
 *   source: JSON.stringify({
 *     openapi: "3.0.0",
 *     info: { title: "my-api", version: "1.0.0" },
 *     servers: [{ url: "https://api.example.com" }],
 *     paths: {
 *       "/users": {
 *         get: {
 *           operationId: "listUsers",
 *           responses: { "200": { description: "ok" } },
 *         },
 *       },
 *     },
 *   }),
 * });
 * ```
 *
 * **Example:** Upload a schema without enabling validation
 * ```typescript
 * const schema = yield* Cloudflare.SchemaValidation.SchemaValidationSchema("DraftSchema", {
 *   zoneId: zone.zoneId,
 *   source: openApiDocument,
 *   validationEnabled: false,
 * });
 * ```
 *
 * ### Toggling validation
 * **Example:** Enable a previously-disabled schema in place
 * ```typescript
 * // Enabling (false → true) patches the schema in place. Disabling an
 * // enabled schema is rejected by Cloudflare, so `true` → `false` (like a
 * // `source` change) replaces the schema instead.
 * yield* Cloudflare.SchemaValidation.SchemaValidationSchema("DraftSchema", {
 *   zoneId: zone.zoneId,
 *   source: openApiDocument,
 *   validationEnabled: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api-shield/security/schema-validation/
 *
 * @resource
 * @product Schema Validation
 * @category Application Security
 */
export const SchemaValidationSchema = Resource(TypeId);
/**
 * Returns true if the given value is a SchemaValidationSchema resource.
 */
export const isSchema = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const SchemaProvider = () => Provider.succeed(SchemaValidationSchema, {
    stables: ["schemaId", "zoneId", "name", "kind", "source", "createdAt"],
    diff: Effect.fn(function* ({ olds, news, output }) {
        if (!isResolved(news))
            return undefined;
        // zoneId is a path param — moving zones is a replacement.
        if (output?.zoneId !== undefined &&
            typeof news.zoneId === "string" &&
            news.zoneId !== output.zoneId) {
            return { action: "replace" };
        }
        // kind is immutable.
        const oldKind = output?.kind ?? olds?.kind ?? "openapi_v3";
        if ((news.kind ?? "openapi_v3") !== oldKind) {
            return { action: "replace" };
        }
        // There is no rename API. A generated name (news.name undefined) is
        // deterministic and therefore never drifts.
        const oldName = output?.name ?? olds?.name;
        if (news.name !== undefined &&
            oldName !== undefined &&
            news.name !== oldName) {
            return { action: "replace" };
        }
        // The uploaded source is immutable. Prefer the previously-passed
        // props as the baseline (what the user last declared) over the
        // stored copy, in case Cloudflare ever normalizes the document.
        const oldSource = olds?.source ?? output?.source;
        if (oldSource !== undefined && news.source !== oldSource) {
            return { action: "replace" };
        }
        // Cloudflare rejects disabling an enabled schema in place
        // ("Disabling a schema is not allowed, delete schema instead.") —
        // converge by replacing: upload a new, disabled copy and delete the
        // old one. Enabling (false → true) is a plain in-place update.
        const oldEnabled = output?.validationEnabled ?? olds?.validationEnabled ?? true;
        if (oldEnabled && news.validationEnabled === false) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const zoneId = output?.zoneId ??
            (typeof olds?.zoneId === "string" ? olds.zoneId : undefined);
        if (zoneId === undefined)
            return undefined;
        if (output?.schemaId) {
            const observed = yield* getSchema(zoneId, output.schemaId);
            return observed ? toAttributes(zoneId, observed) : undefined;
        }
        // Cold read — recover from lost state by matching the deterministic
        // name. Names are not unique server-side and carry no ownership
        // marker, so brand the match `Unowned` and let the engine gate
        // takeover behind adoption.
        const name = yield* createSchemaName(id, olds?.name);
        const match = yield* findByName(zoneId, name);
        if (match === undefined)
            return undefined;
        const observed = yield* getSchema(zoneId, match.schemaId);
        return observed ? Unowned(toAttributes(zoneId, observed)) : undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        const name = yield* createSchemaName(id, news.name);
        const desiredEnabled = news.validationEnabled ?? true;
        // 1. Observe — the cached schemaId is a hint, not a guarantee: a
        //    SchemaNotFound falls through to "missing" and we re-upload.
        const observed = output?.schemaId
            ? yield* getSchema(zoneId, output.schemaId)
            : undefined;
        // 2. Ensure — upload when missing. Names are not unique server-side,
        //    so there is no AlreadyExists race to tolerate.
        if (observed === undefined) {
            const created = yield* schemaValidation.createSchema({
                zoneId,
                kind: news.kind ?? "openapi_v3",
                name,
                source: news.source,
                validationEnabled: desiredEnabled,
            });
            return toAttributes(zoneId, created);
        }
        // 3. Sync — `validationEnabled` is the only mutable aspect; the
        //    source/name/kind are immutable and disabling is rejected by the
        //    API, so diff replaces on those changes. Skip the API call
        //    entirely on a no-op.
        if ((observed.validationEnabled ?? false) === desiredEnabled) {
            return toAttributes(zoneId, observed);
        }
        const patched = yield* schemaValidation.patchSchema({
            zoneId,
            schemaId: observed.schemaId,
            validationEnabled: desiredEnabled,
        });
        // The PATCH response omits the stored source (returns "") — keep the
        // observed copy so the attributes stay faithful.
        return toAttributes(zoneId, { ...patched, source: observed.source });
    }),
    delete: Effect.fn(function* ({ output }) {
        // Idempotent — a schema already deleted out-of-band is success.
        yield* schemaValidation
            .deleteSchema({ zoneId: output.zoneId, schemaId: output.schemaId })
            .pipe(Effect.catchTag("SchemaNotFound", () => Effect.void));
    }),
    // Zone-scoped collection: schemas live under `/zones/{zone_id}/...`, so
    // enumerate every zone in the account and list its schemas, paginating
    // each exhaustively. `omitSource: false` hydrates the full `read`
    // Attributes shape. Zones whose route is invalid (deleted/partial) reject
    // with the typed `InvalidRoute` — skip them rather than failing the whole
    // enumeration.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => schemaValidation.listSchemas
            .pages({ zoneId: zone.id, omitSource: false })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((schema) => toAttributes(zone.id, schema)))), 
        // Skip zones schema-validation can't enumerate: `InvalidRoute`
        // (feature not available on the zone), `ZonePurged` (the
        // account-wide zone listing can momentarily include a zone that
        // has since been purged), and `Forbidden` (the scoped token /
        // zone plan doesn't grant schema-validation access).
        Effect.catchTag(["InvalidRoute", "ZonePurged", "Forbidden"], () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
});
/**
 * Read a schema by id, mapping "gone" (`SchemaNotFound`, Cloudflare error
 * code 19400) to `undefined`.
 */
const getSchema = (zoneId, schemaId) => schemaValidation
    .getSchema({ zoneId, schemaId, omitSource: false })
    .pipe(Effect.catchTag("SchemaNotFound", () => Effect.succeed(undefined)));
/**
 * Find a schema by exact name (meta-data only — sources omitted). If several
 * schemas carry the same name, pick the oldest for determinism.
 */
const findByName = (zoneId, name) => schemaValidation.listSchemas.items({ zoneId, omitSource: true }).pipe(Stream.filter((s) => s.name === name), Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .at(0)));
const createSchemaName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const toAttributes = (zoneId, schema) => ({
    schemaId: schema.schemaId,
    zoneId,
    name: schema.name,
    kind: schema.kind,
    source: schema.source,
    validationEnabled: schema.validationEnabled ?? false,
    createdAt: schema.createdAt,
});
//# sourceMappingURL=Schema.js.map