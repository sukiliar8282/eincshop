import * as pipelines from "@distilled.cloud/cloudflare/pipelines";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const StreamTypeId: "Cloudflare.Pipelines.Stream";
type StreamTypeId = typeof StreamTypeId;
/**
 * Scalar field types accepted by a structured stream schema.
 */
export type StreamFieldType = "int32" | "int64" | "float32" | "float64" | "bool" | "string" | "binary" | "json";
/**
 * A single field of a structured stream schema. `timestamp` fields
 * additionally accept a `unit`.
 */
export type StreamField = {
    /** Field type. */
    type: StreamFieldType;
    /** Field name as it appears in ingested events. */
    name: string;
    /** Whether the field must be present in every event. */
    required?: boolean;
    /** Name to expose to SQL when it differs from `name`. */
    sqlName?: string;
    /** Metadata key the field is populated from instead of the event body. */
    metadataKey?: string;
} | {
    /** Timestamp field type. */
    type: "timestamp";
    /** Field name as it appears in ingested events. */
    name: string;
    /** Whether the field must be present in every event. */
    required?: boolean;
    /** Name to expose to SQL when it differs from `name`. */
    sqlName?: string;
    /** Metadata key the field is populated from instead of the event body. */
    metadataKey?: string;
    /**
     * Precision of the timestamp.
     * @default "millisecond"
     */
    unit?: "second" | "millisecond" | "microsecond" | "nanosecond";
};
/**
 * Input format of events ingested by the stream.
 */
export interface StreamFormat {
    /** Only JSON ingestion is supported. */
    type: "json";
    /**
     * Accept events of any shape (no schema enforcement).
     */
    unstructured?: boolean;
    /**
     * How timestamps are rendered in ingested JSON.
     * @default "rfc3339"
     */
    timestampFormat?: "rfc3339" | "unix_millis";
    /** How decimals are encoded in ingested JSON. */
    decimalEncoding?: "number" | "string" | "bytes";
}
/**
 * HTTP ingest endpoint configuration. Mutable in place.
 */
export interface StreamHttp {
    /**
     * Whether the stream exposes an HTTP ingest endpoint.
     * @default true
     */
    enabled?: boolean;
    /**
     * Whether requests to the HTTP endpoint must carry a Cloudflare API
     * token.
     * @default false
     */
    authentication?: boolean;
    /** CORS configuration for browser-originated ingestion. */
    cors?: {
        /** Allowed origins, e.g. `["https://app.example.com"]` or `["*"]`. */
        origins?: string[];
    };
}
export interface StreamProps {
    /**
     * Name of the stream. Unique per account; must be alphanumeric and
     * underscores only (it is referenced as a SQL table name). If omitted,
     * a unique name is generated from the app, stage, and logical ID.
     * Changing the name triggers a replacement.
     * @default ${app}_${id}_${stage}_${suffix}
     */
    name?: string;
    /**
     * Structured schema of ingested events. Immutable — changing the schema
     * triggers a replacement. When omitted, the stream accepts unstructured
     * JSON events.
     */
    schema?: {
        /** Fields of the structured schema. */
        fields: StreamField[];
    };
    /**
     * Input format configuration. Immutable — changing it triggers a
     * replacement.
     * @default { type: "json" }
     */
    format?: StreamFormat;
    /**
     * HTTP ingest endpoint configuration. Mutable in place.
     * @default { enabled: true, authentication: false }
     */
    http?: StreamHttp;
    /**
     * Whether Workers can send events to this stream via a `pipelines`
     * binding. Mutable in place.
     * @default { enabled: true }
     */
    workerBinding?: {
        /** Whether the Worker binding is enabled. */
        enabled: boolean;
    };
}
export interface StreamAttributes {
    /** Cloudflare-assigned stream identifier. */
    streamId: string;
    /** Account that owns the stream. */
    accountId: string;
    /** Stream name (unique per account). */
    name: string;
    /** HTTP ingest endpoint URL, when HTTP ingestion is enabled. */
    endpoint: string | undefined;
    /** Whether the HTTP ingest endpoint is enabled. */
    httpEnabled: boolean;
    /** Whether the HTTP ingest endpoint requires authentication. */
    httpAuthentication: boolean;
    /** Allowed CORS origins of the HTTP ingest endpoint. */
    corsOrigins: string[] | undefined;
    /** Whether Workers can send events via a `pipelines` binding. */
    workerBindingEnabled: boolean;
    /** Current version of the stream. */
    version: number;
    /** When the stream was created. */
    createdAt: string;
    /** When the stream was last modified. */
    modifiedAt: string;
}
export type Stream = Resource<StreamTypeId, StreamProps, StreamAttributes, never, Providers>;
/**
 * A Cloudflare Pipelines stream — the ingestion endpoint of the Pipelines
 * product. Events are sent to a stream over HTTP (and/or from Workers via
 * a binding), transformed by a SQL {@link Pipeline}, and written to a
 * {@link Sink}.
 *
 * The stream's `schema` and `format` are fixed at creation (changing them
 * triggers a replacement); the HTTP endpoint and Worker-binding toggles
 * are mutable in place.
 * ### Creating a Stream
 * **Example:** Unstructured stream with default settings
 * ```typescript
 * const stream = yield* Cloudflare.Pipelines.Stream("events", {});
 * ```
 *
 * **Example:** Structured stream with a typed schema
 * ```typescript
 * const stream = yield* Cloudflare.Pipelines.Stream("clicks", {
 *   schema: {
 *     fields: [
 *       { type: "string", name: "url", required: true },
 *       { type: "timestamp", name: "ts", unit: "millisecond" },
 *     ],
 *   },
 * });
 * ```
 *
 * ### HTTP ingestion
 * **Example:** Authenticated endpoint with CORS
 * ```typescript
 * const stream = yield* Cloudflare.Pipelines.Stream("events", {
 *   http: {
 *     enabled: true,
 *     authentication: true,
 *     cors: { origins: ["https://app.example.com"] },
 *   },
 * });
 * // POST events to stream.endpoint with an API token
 * ```
 *
 * ### Wiring into a Pipeline
 * **Example:** Stream → SQL Pipeline → R2 Sink
 * ```typescript
 * const pipeline = yield* Cloudflare.Pipelines.Pipeline("etl", {
 *   sql: Output.interpolate`INSERT INTO ${sink.name} SELECT * FROM ${stream.name}`,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/pipelines/
 *
 * @resource
 * @product Pipelines
 * @category Storage & Databases
 */
export declare const Stream: import("../../Resource.ts").ResourceClass<Stream>;
/**
 * Returns true if the given value is a Stream resource.
 */
export declare const isStream: (value: unknown) => value is Stream;
export declare const StreamProvider: () => import("effect/Layer").Layer<Provider.Provider<Stream>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | pipelines.CloudflareOpContext>;
export {};
//# sourceMappingURL=Stream.d.ts.map