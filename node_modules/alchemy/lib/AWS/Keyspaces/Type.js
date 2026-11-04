import * as keyspaces from "@distilled.cloud/aws/keyspaces";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * An Amazon Keyspaces (for Apache Cassandra) user-defined type (UDT) — a
 * named group of fields usable as a column type in tables of the same
 * keyspace.
 *
 * UDTs are immutable: any change to the field definitions replaces the type.
 * A type used by a table (or nested in another type) cannot be deleted until
 * its consumers are gone.
 * ### Creating a Type
 * **Example:** Address Type
 * ```typescript
 * const address = yield* Type("Address", {
 *   keyspaceName: keyspace.keyspaceName,
 *   fields: [
 *     { name: "street", type: "text" },
 *     { name: "city", type: "text" },
 *     { name: "zip", type: "text" },
 *   ],
 * });
 * ```
 *
 * **Example:** Use the Type in a Table Column
 * ```typescript
 * const table = yield* Table("Customers", {
 *   keyspaceName: keyspace.keyspaceName,
 *   columns: [
 *     { name: "id", type: "uuid" },
 *     { name: "shipping", type: `frozen<${address.typeName}>` },
 *   ],
 *   partitionKeys: ["id"],
 * });
 * ```
 *
 * @resource
 */
export const Type = Resource("AWS.Keyspaces.Type");
const fieldsKey = (fields) => JSON.stringify((fields ?? []).map((f) => [f.name, f.type]));
export const TypeProvider = () => Provider.effect(Type, Effect.gen(function* () {
    const toName = (id, props) => props.typeName
        ? Effect.succeed(props.typeName)
        : createPhysicalName({ id, maxLength: 48 }).pipe(Effect.map((n) => n.replaceAll("-", "_").toLowerCase()));
    const readType = Effect.fn(function* (keyspaceName, typeName) {
        return yield* keyspaces
            .getType({ keyspaceName, typeName })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const toAttributes = (found) => ({
        keyspaceName: found.keyspaceName,
        typeName: found.typeName,
        keyspaceArn: found.keyspaceArn,
    });
    return {
        stables: ["keyspaceName", "typeName", "keyspaceArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            const oldProps = olds;
            if (oldProps === undefined)
                return undefined;
            if (news.keyspaceName !== oldProps.keyspaceName) {
                return { action: "replace" };
            }
            if ((yield* toName(id, oldProps)) !== (yield* toName(id, news))) {
                return { action: "replace" };
            }
            // UDTs are immutable — any field change replaces the type.
            if (fieldsKey(news.fields) !== fieldsKey(oldProps.fields)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const props = (olds ?? {});
            const keyspaceName = output?.keyspaceName ?? props.keyspaceName;
            if (keyspaceName === undefined)
                return undefined;
            const typeName = output?.typeName ?? (yield* toName(id, props));
            const found = yield* readType(keyspaceName, typeName);
            // Types are not taggable, so ownership cannot be branded; a found
            // type is treated as ours (names are deterministic per instance).
            return found === undefined ? undefined : toAttributes(found);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const props = news;
            const keyspaceName = props.keyspaceName;
            const typeName = output?.typeName ?? (yield* toName(id, props));
            // 1. Observe — cloud state is authoritative.
            let observed = yield* readType(keyspaceName, typeName);
            // 2. Ensure — create if missing; tolerate the AlreadyExists race.
            if (observed === undefined) {
                yield* keyspaces
                    .createType({
                    keyspaceName,
                    typeName,
                    fieldDefinitions: props.fields.map((f) => ({
                        name: f.name,
                        type: f.type,
                    })),
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.void));
                // Creation is effectively synchronous but GetType can briefly 404
                // right after create; retry a few times.
                observed = yield* readType(keyspaceName, typeName).pipe(Effect.flatMap((t) => t === undefined
                    ? Effect.fail(new Error(`Type '${keyspaceName}.${typeName}' not found`))
                    : Effect.succeed(t)), Effect.retry({
                    schedule: Schedule.max([
                        Schedule.fixed("2 seconds"),
                        Schedule.recurs(10),
                    ]),
                }));
            }
            // 3. Sync — nothing to sync: UDTs have no mutable aspects (any
            //    field change is a replacement, decided in diff).
            yield* session.note(`${keyspaceName}.${typeName}`);
            return toAttributes(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            const { keyspaceName, typeName } = output;
            yield* keyspaces.deleteType({ keyspaceName, typeName }).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), 
            // A type still referenced by a table/type that is itself being
            // deleted rejects with ConflictException; retry briefly.
            Effect.retry({
                while: (e) => e._tag === "ConflictException",
                schedule: Schedule.max([
                    Schedule.fixed("3 seconds"),
                    Schedule.recurs(20),
                ]),
            }));
            // Wait (bounded) until the type is gone so the parent keyspace can
            // be deleted without a ConflictException.
            yield* readType(keyspaceName, typeName).pipe(Effect.flatMap((t) => t === undefined
                ? Effect.void
                : Effect.fail(new Error(`Type '${typeName}' still deleting`))), Effect.retry({
                schedule: Schedule.max([
                    Schedule.fixed("3 seconds"),
                    Schedule.recurs(20),
                ]),
            }), Effect.catch(() => Effect.void));
        }),
        // Types are keyed by a parent keyspace and cannot be enumerated
        // account-wide without iterating every keyspace; treated as a
        // sub-resource per the factory list() convention.
        list: () => Effect.succeed([]),
    };
}));
//# sourceMappingURL=Type.js.map