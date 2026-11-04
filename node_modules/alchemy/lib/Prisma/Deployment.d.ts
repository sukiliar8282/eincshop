import * as Effect from "effect/Effect";
import * as Path from "effect/Path";
import * as Redacted from "effect/Redacted";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { type ArtifactFile } from "./Internal/ArtifactFile.ts";
import type { App } from "./App.ts";
import type { Providers } from "./Providers.ts";
export declare const MAX_DEPLOYMENT_ARTIFACT_BYTES: number;
export interface DeploymentProps {
    /**
     * App ID or Prisma.App resource that owns this deployment.
     */
    app: string | App;
    /**
     * Port mapping for the deployment. Set `http` to `null` to reset to
     * Foundry's default port (8080); non-null values must be integers from
     * 1 through 65535.
     */
    portMapping?: {
        http?: number | null;
    };
    /**
     * Create the deployment by reusing the App's currently promoted artifact
     * instead of uploading code. Requires an existing promoted deployment.
     */
    skipCodeUpload?: boolean;
    /**
     * Path to a pre-created artifact file to upload to the pre-signed upload URL.
     */
    artifactPath?: string;
    /**
     * Content type for artifact uploads.
     *
     * @default "application/octet-stream"
     */
    artifactContentType?: string;
    /**
     * Start the deployment after it is created.
     *
     * @default false
     */
    start?: boolean;
    /**
     * Promote the deployment to the App's stable endpoint after start.
     * If `start` is omitted, enabling promotion starts the deployment first.
     *
     * @default false
     */
    promote?: boolean;
    /**
     * Opaque key/value map; when any resolved value changes, a replacement
     * deployment is planned (create-before-delete) even if the artifact is
     * unchanged — the same contract as `AWS.ApiGateway.Deployment.triggers`.
     * Because values here may be secrets, they are folded into the deployment
     * fingerprint as a salted hash and persisted `Redacted` rather than
     * compared as plaintext; plaintext never lands in state.
     *
     * Prisma snapshots environment variables into a deployment when the
     * deployment is created, so changing only an environment variable's value
     * updates the platform's variable record but never reaches the running app.
     * Pass those values here to make such a change take effect.
     *
     * Members may be wrapped in `Redacted.make(secret)`; they are unwrapped only
     * to compute the fingerprint.
     *
     * If the value cannot be resolved while the deploy is being planned —
     * because it reads an attribute of another resource that the same deploy is
     * changing — the diff cannot prove the fingerprint is unchanged, and the
     * engine offers no later opportunity to plan a replacement. The deployment
     * is then replaced conservatively, but only once a fingerprint has already
     * been recorded: adding `triggers` to an existing deployment records its
     * fingerprint through a plain update rather than forcing a replacement.
     *
     * Leaving `triggers` unset tracks nothing, so removing it from a
     * deployment that had it does not trigger a replacement on its own.
     *
     * @example
     * ```typescript
     * const deployment = yield* Prisma.Deployment("web", {
     *   app,
     *   artifactPath: "./dist/app.tar.gz",
     *   triggers: { DATABASE_URL: Redacted.make(databaseUrl) },
     *   start: true,
     *   promote: true,
     * });
     * ```
     */
    triggers?: Record<string, unknown>;
}
export interface Deployment extends Resource<"Prisma.Deployment", DeploymentProps, {
    /**
     * Prisma deployment ID.
     */
    deploymentId: string;
    /**
     * App ID that owns the deployment.
     */
    appId: string;
    /**
     * Foundry version ID returned by the Prisma Management API.
     */
    foundryVersionId: string;
    /**
     * Current deployment status, when observed.
     */
    status: string | undefined;
    /**
     * Preview endpoint domain for the deployment.
     */
    previewDomain: string | null | undefined;
    /**
     * Hash of the artifact bytes uploaded for this deployment, when Alchemy
     * uploaded an artifact.
     */
    artifactHash?: string;
    /**
     * Salted fingerprint of the resolved `triggers` inputs this deployment
     * was created for. Held `Redacted` so the inputs stay out of plaintext
     * state; absent when `triggers` is unset.
     */
    triggersHash?: Redacted.Redacted<string>;
    /**
     * Stable App endpoint domain after promotion.
     */
    appEndpointDomain: string | undefined;
    /**
     * ISO timestamp when the deployment was created, when observed.
     */
    createdAt: string | undefined;
}, never, Providers> {
}
/**
 * A Prisma deployment owned by an App.
 *
 * This is the low-level resource: it can upload or reuse an artifact, start it,
 * and promote it, but it does not provide `Prisma.Compute`'s preview/stable
 * health checks or automatic rollback. Prefer `Prisma.Compute` for production
 * application deployments.
 *
 * Prisma's create-deployment API currently exposes neither an idempotency key
 * nor a caller-defined natural key. After a crash that loses state immediately
 * after creation, Alchemy deliberately does not adopt the App's latest
 * deployment: doing so could take ownership of an unrelated deployment. When
 * persisted state contains a Foundry version ID, refresh may safely recover the
 * matching deployment.
 *
 * ### Creating a Deployment
 * **Example:** Fork the currently promoted artifact
 * ```typescript
 * const deployment = yield* Prisma.Deployment("web-v2", {
 *   app: app.appId,
 *   skipCodeUpload: true,
 *   start: true,
 *   promote: true,
 * });
 * ```
 *
 * **Example:** Upload a prebuilt artifact
 * ```typescript
 * const deployment = yield* Prisma.Deployment("web-v3", {
 *   app: app.appId,
 *   artifactPath: "./dist/app.tar.gz",
 *   artifactContentType: "application/gzip",
 *   start: true,
 *   promote: true,
 * });
 * ```
 *
 * @resource
 */
export declare const Deployment: import("../Resource.ts").ResourceClass<Deployment>;
export interface ReadUploadArtifactInput {
    artifact?: string | Uint8Array;
    artifactPath?: string;
    output?: "bytes" | "file";
}
export declare function readUploadArtifact(input: ReadUploadArtifactInput & {
    readonly output: "file";
}): Effect.Effect<ArtifactFile | undefined, Error, Path.Path>;
export declare function readUploadArtifact(input: ReadUploadArtifactInput & {
    readonly output?: "bytes";
}): Effect.Effect<Uint8Array | undefined, Error, Path.Path>;
export declare function readUploadArtifact(input: ReadUploadArtifactInput): Effect.Effect<Uint8Array | ArtifactFile | undefined, Error, Path.Path>;
export declare const validateDeploymentArtifactBytes: (artifact: Uint8Array, maxBytes?: number) => Effect.Effect<never, Error, never> | Effect.Effect<Uint8Array<ArrayBufferLike>, never, never>;
export declare const uploadArtifact: (uploadUrl: string, artifact: Uint8Array | ArtifactFile, contentType: string) => Effect.Effect<undefined, Error, import("effect/unstable/http/HttpClient").HttpClient>;
export declare const DeploymentProvider: () => import("effect/Layer").Layer<Provider.Provider<Deployment>, never, any>;
//# sourceMappingURL=Deployment.d.ts.map