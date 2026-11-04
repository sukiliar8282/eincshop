import type { AddOnsResponseEdgesItemNode } from "@distilled.cloud/fly-io/addons";
import * as addons from "@distilled.cloud/fly-io/addons";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
/** Env-var names Tigris HTTP bindings write onto an App (same as `fly storage create`). */
export declare const BUCKET_SECRET_NAMES: readonly ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_ENDPOINT_URL_S3", "AWS_REGION", "BUCKET_NAME"];
export type BucketSecretName = (typeof BUCKET_SECRET_NAMES)[number];
/**
 * Shadow bucket used to migrate from another S3-compatible store.
 * Every field is required when set.
 */
export interface BucketShadow {
    /** Shadow-bucket access key id. */
    accessKey: string;
    /** Shadow-bucket secret. Wrap with `Redacted.make`. */
    secretKey: Redacted.Redacted<string> | string;
    /** Shadow-bucket region. */
    region: string;
    /** Shadow-bucket name. */
    name: string;
    /** Shadow-bucket S3 endpoint URL. */
    endpoint: string;
    /**
     * Dual-write new objects back to the shadow bucket.
     *
     * @default false
     */
    writeThrough?: boolean;
}
export interface BucketProps {
    /**
     * Tigris bucket / add-on name. Globally unique, DNS-compatible
     * (lowercase letters, digits, hyphens), must start with a letter,
     * max 63 characters. If omitted, a unique name is generated from
     * the stack, stage and logical ID. Changing it replaces the Bucket.
     */
    name?: string;
    /**
     * Organization slug. Defaults to the current token's org
     * (`getCurrentToken`). Changing it replaces the Bucket.
     */
    orgSlug?: string;
    /**
     * Serve objects without credentials. Default is private.
     *
     * @default false
     */
    public?: boolean;
    /**
     * Custom domain for public website hosting. Maps to Tigris
     * `options.website.domain_name`. Empty string when omitted
     * (the Tigris API requires the field).
     */
    domainName?: string;
    /**
     * Tigris accelerate. Default is off.
     *
     * @default false
     */
    accelerate?: boolean;
    /**
     * Shadow bucket for zero-downtime migration from another
     * S3-compatible store. Every nested field is required when set.
     */
    shadowBucket?: BucketShadow;
}
export type Bucket = Resource<"Fly.Bucket", BucketProps, {
    /** Fly GraphQL add-on id. Identity of the Bucket. */
    addOnId: string;
    /** Physical Tigris add-on / bucket name. */
    name: string;
    /** Observed provisioning status (`ready`, …). */
    status: string | undefined;
    /** Organization slug. */
    orgSlug: string | undefined;
    /** Whether the bucket is public. */
    public: boolean;
    /** Custom website domain, if set. */
    domainName: string | undefined;
    /** Tigris accelerate. */
    accelerate: boolean;
    /** Tigris SSO dashboard URL, if the API returned one. */
    ssoLink: string | undefined;
    /** RFC3339 creation timestamp. */
    createdAt: string | undefined;
    /**
     * `AWS_ACCESS_KEY_ID` from `createAddOn.environment`. Never logged.
     */
    accessKeyId: Redacted.Redacted<string> | undefined;
    /**
     * `AWS_SECRET_ACCESS_KEY` from `createAddOn.environment`. Never logged.
     */
    secretAccessKey: Redacted.Redacted<string> | undefined;
    /**
     * `AWS_ENDPOINT_URL_S3` from `createAddOn.environment`. Never logged.
     */
    endpoint: Redacted.Redacted<string> | undefined;
    /**
     * `AWS_REGION` from `createAddOn.environment`. Never logged.
     */
    region: Redacted.Redacted<string> | undefined;
    /**
     * `BUCKET_NAME` from `createAddOn.environment`. Never logged.
     */
    bucketName: Redacted.Redacted<string> | undefined;
}, never, Providers>;
/**
 * A Fly.Bucket is Tigris S3-compatible object storage, billed through
 * Fly. It is an org-scoped GraphQL add-on (`AddOnType` `tigris`).
 *
 * @see https://fly.io/docs/tigris/
 *
 * ### Create a Bucket
 * Alchemy generates a unique name unless you pass one.
 *
 * **Example:** Generated name
 * ```typescript
 * const data = yield* Fly.Bucket("Data");
 * ```
 *
 * ### A stable name
 * Pass `name` when you need a stable Tigris bucket name.
 *
 * **Example:** Explicit name
 * ```typescript
 * const data = yield* Fly.Bucket("Data", {
 *   name: "my-bucket",
 * });
 * ```
 *
 * :::caution[Changing `name` replaces the Bucket]
 * Tigris cannot rename a bucket. Alchemy creates the new name, then
 * deletes the old one.
 * :::
 *
 * ### Organization
 * Org defaults to the current token. Pass `orgSlug` to pin it.
 *
 * **Example:** Pin an org
 * ```typescript
 * const data = yield* Fly.Bucket("Data", {
 *   orgSlug: "my-org",
 * });
 * ```
 *
 * :::caution[Changing `orgSlug` replaces the Bucket]
 * The bucket is created in the new org. The old bucket is deleted.
 * :::
 *
 * ### Public access
 * Buckets are private by default. `public: true` serves objects
 * without credentials.
 *
 * **Example:** Public bucket
 * ```typescript
 * const assets = yield* Fly.Bucket("Assets", {
 *   public: true,
 * });
 * ```
 *
 * ### Custom domain
 * `domainName` sets `website.domain_name` on the add-on. Point a
 * CNAME at `{name}.t3.tigrisbucket.io`.
 *
 * **Example:** Custom domain
 * ```typescript
 * const assets = yield* Fly.Bucket("Assets", {
 *   public: true,
 *   domainName: "assets.example.com",
 * });
 * ```
 *
 * ### Put and get objects
 * Tigris speaks the S3 API. Bind {@link PutObject} / {@link GetObject}
 * (and the other S3 object ops) in Service init. Alchemy injects the
 * Tigris endpoint and credentials; you never read `AWS_*` yourself.
 *
 * **Example:** Put an object from a Service
 * ```typescript
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
 *
 * export default class Api extends Fly.Service<Api>()(
 *   "Api",
 *   { app: Site, main: import.meta.url, port: 3000 },
 *   Effect.gen(function* () {
 *     const putObject = yield* Fly.PutObject(Data);
 *     const getObject = yield* Fly.GetObject(Data);
 *
 *     return {
 *       fetch: Effect.gen(function* () {
 *         yield* putObject({
 *           Key: "hello.txt",
 *           Body: "hello",
 *           ContentType: "text/plain",
 *         });
 *         const obj = yield* getObject({ Key: "hello.txt" });
 *         return HttpServerResponse.json({ ok: obj.ETag !== undefined });
 *       }),
 *     };
 *   }).pipe(Effect.provide([Fly.PutObjectHttp, Fly.GetObjectHttp])),
 * ) {}
 * ```
 *
 * ### Fly.Secret
 * You can also set each key yourself with {@link Secret}.
 *
 * **Example:** Manual secrets
 * ```typescript
 * yield* Fly.Secret("BucketName", {
 *   app: Site,
 *   name: "BUCKET_NAME",
 *   value: Data.bucketName,
 * });
 * ```
 *
 * @resource
 */
export declare const Bucket: import("../Resource.ts").ResourceClass<Bucket>;
declare const BucketNotCreated_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.BucketNotCreated";
} & Readonly<A>;
export declare class BucketNotCreated extends BucketNotCreated_base<{
    name: string;
}> {
}
declare const BucketOrgMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.BucketOrgMissing";
} & Readonly<A>;
export declare class BucketOrgMissing extends BucketOrgMissing_base<{
    orgSlug: string;
}> {
}
declare const BucketProvisionFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.BucketProvisionFailed";
} & Readonly<A>;
export declare class BucketProvisionFailed extends BucketProvisionFailed_base<{
    name: string;
    status: string | undefined;
    errorMessage: string | undefined;
}> {
}
export declare const listTigrisAddOns: () => Effect.Effect<AddOnsResponseEdgesItemNode[], addons.FlyIoOpError, addons.FlyIoOpContext>;
export declare const BucketProvider: () => import("effect/Layer").Layer<Provider.Provider<Bucket>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | addons.FlyIoOpContext>;
/**
 * Write Tigris `AWS_*` / `BUCKET_NAME` secrets onto an App. Called from
 * {@link Service} reconcile so the secrets exist before Machines boot.
 *
 * Looks up the add-on by id/name (retrying while Tigris is still
 * provisioning) and also copies any already-evaluated `AWS_*` /
 * `BUCKET_NAME` values from binding env — GraphQL `environment` is often
 * empty after create.
 */
export declare const attachBucketSecrets: (appName: string, attached: readonly {
    name: string;
    id?: string;
}[], boundEnv?: Record<string, string> | undefined) => Effect.Effect<void, import("@distilled.cloud/fly-io").BadRequest | import("@distilled.cloud/fly-io").Forbidden | import("@distilled.cloud/fly-io").NotFound | addons.FlyIoOpError, addons.FlyIoOpContext>;
export {};
//# sourceMappingURL=Bucket.d.ts.map