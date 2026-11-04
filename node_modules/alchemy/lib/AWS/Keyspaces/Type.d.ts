import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * A field of a user-defined type. `type` is a CQL data type such as `text`,
 * `int`, `uuid`, a collection like `list<text>`, or another (frozen)
 * user-defined type.
 */
export interface KeyspacesField {
    /** Field name. */
    name: string;
    /** CQL data type, e.g. `text`, `int`, `uuid`. */
    type: string;
}
export interface TypeProps {
    /**
     * Name of the keyspace that owns the type. Changing it replaces the type.
     */
    keyspaceName: string;
    /**
     * Name of the user-defined type. Must be 1-48 characters of
     * `[a-zA-Z0-9_]`; Cassandra lowercases unquoted identifiers, so lowercase
     * names are recommended. If omitted a deterministic physical name is
     * generated. Changing the name replaces the type.
     */
    typeName?: string;
    /**
     * Field definitions of the type. Amazon Keyspaces user-defined types are
     * immutable — any change to the fields replaces the type.
     */
    fields: KeyspacesField[];
}
export interface Type extends Resource<"AWS.Keyspaces.Type", TypeProps, {
    /**
     * Name of the keyspace that owns the type.
     */
    keyspaceName: string;
    /**
     * The type's physical name.
     */
    typeName: string;
    /**
     * ARN of the owning keyspace (the Keyspaces API does not expose a
     * per-type ARN).
     */
    keyspaceArn: string;
}, never, Providers> {
}
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
export declare const Type: import("../../Resource.ts").ResourceClass<Type>;
export declare const TypeProvider: () => import("effect/Layer").Layer<Provider.Provider<Type>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Type.d.ts.map