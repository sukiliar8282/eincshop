import { Credentials } from "@distilled.cloud/aws/Credentials";
import type { RegionName } from "@distilled.cloud/aws/Region";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { RuntimeContext } from "../RuntimeContext.ts";
import type { Bucket } from "./Bucket.ts";
declare const RailwayS3CredentialsMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Railway.S3CredentialsMissing";
} & Readonly<A>;
/**
 * Shared scaffolding for Railway S3 bindings.
 *
 * Railway buckets speak the S3 API. Each `{Op}Http.ts` is a thin
 * `Layer.effect(Cap, makeRailwayS3Binding({ operation }))` that:
 * - registers the bucket on the host so Service reconcile can write
 *   `AWS_*` / `BUCKET_NAME` variables
 * - calls `@distilled.cloud/aws/s3` with those credentials and endpoint
 *
 * NOT exported from `index.ts`.
 */
export declare class RailwayS3CredentialsMissing extends RailwayS3CredentialsMissing_base<{
    name: string;
}> {
}
export interface RailwayS3Scope {
    bucketName: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
    region: RegionName;
}
export declare const makeRailwayS3Binding: <I extends {
    Bucket?: string;
}, A, E>(options: {
    tag: string;
    operation: (input: I) => Effect.Effect<A, E, Credentials | HttpClient.HttpClient>;
}) => Effect.Effect<(bucket: Bucket) => Effect.Effect<(request?: Omit<I, "Bucket"> | undefined) => Effect.Effect<A, E | Config.ConfigError | RailwayS3CredentialsMissing, RuntimeContext>, never, never>, never, never>;
export {};
//# sourceMappingURL=BucketBinding.d.ts.map