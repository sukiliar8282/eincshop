import * as aoss from "@distilled.cloud/aws/opensearchserverless";
import * as Effect from "effect/Effect";
declare const OpenSearchServerlessProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "OpenSearchServerlessProvisioningFailed";
} & Readonly<A>;
/**
 * Raised when a collection (or VPC endpoint) provisioning terminates in a
 * `FAILED` state or never reaches `ACTIVE` within the bounded polling budget.
 */
export declare class OpenSearchServerlessProvisioningFailed extends OpenSearchServerlessProvisioningFailed_base<{
    readonly resource: string;
    readonly id: string;
    readonly status: string | undefined;
    readonly failureCode: string | undefined;
    readonly failureMessage: string | undefined;
}> {
}
/**
 * Serialize a security/access policy document to the compact JSON string the
 * OpenSearch Serverless API expects. Passing through a string is a no-op so
 * callers may interpolate `Output`-derived collection names into the policy
 * themselves.
 */
export declare const stringifyPolicy: (policy: string | Record<string, unknown> | readonly unknown[]) => string;
/**
 * Normalize a policy document (string or object) to a stable JSON string for
 * drift comparison — parse-then-stringify so key ordering differences between
 * the desired document and the API's echoed document do not force a spurious
 * update.
 */
export declare const canonicalizePolicy: (policy: string | Record<string, unknown> | readonly unknown[] | undefined) => string;
/** Convert the API's `[{ key, value }]` tag list into a plain record. */
export declare const tagsToRecord: (tags: aoss.Tag[] | undefined) => Record<string, string>;
/** Convert a plain record into the API's `[{ key, value }]` tag list. */
export declare const recordToTagList: (tags: Record<string, string>) => aoss.Tag[];
/**
 * Await a collection reaching `ACTIVE`, failing with
 * `OpenSearchServerlessProvisioningFailed` on a `FAILED` terminal status or a
 * budget timeout.
 */
export declare const awaitCollectionActive: (id: string) => Effect.Effect<aoss.CollectionDetail, OpenSearchServerlessProvisioningFailed | aoss.BatchGetCollectionError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Await a VPC endpoint reaching `ACTIVE`, failing with
 * `OpenSearchServerlessProvisioningFailed` on a `FAILED` terminal status or a
 * budget timeout.
 */
export declare const awaitVpcEndpointActive: (id: string) => Effect.Effect<aoss.VpcEndpointDetail, OpenSearchServerlessProvisioningFailed | aoss.BatchGetVpcEndpointError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Bounded retry through the `ConflictException` window that AOSS raises while a
 * dependent resource is still tearing down — e.g. deleting an encryption
 * `SecurityPolicy` while its `Collection` deletion is still propagating.
 * Explicitly typed for the same declaration-emit reason as above.
 */
export declare const retryWhileConflict: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
export {};
//# sourceMappingURL=internal.d.ts.map