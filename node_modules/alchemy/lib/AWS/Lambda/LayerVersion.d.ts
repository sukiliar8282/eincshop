import type * as lambda from "@distilled.cloud/aws/lambda";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Reference to an S3 bucket: a raw bucket name or anything exposing a
 * `bucketName` attribute (e.g. an `AWS.S3.Bucket` resource).
 */
export type BucketRef = string | {
    bucketName: string;
};
/**
 * Layer content stored in S3. Use this instead of {@link LayerVersionProps.path}
 * for archives larger than the 50 MB direct-upload limit.
 */
export interface LayerVersionS3Content {
    /**
     * S3 bucket holding the layer archive — an `AWS.S3.Bucket` resource or a
     * raw bucket name.
     */
    bucket: BucketRef;
    /** Key of the layer archive object. */
    key: string;
    /** Version id of the object, for versioned buckets. */
    objectVersion?: string;
}
export interface LayerVersionProps {
    /**
     * Name of the layer. If omitted, a unique name is generated.
     */
    layerName?: string;
    /**
     * Local path to the layer content — either a directory whose contents are
     * packaged into a zip archive, or an existing `.zip` file uploaded as-is.
     *
     * Layer archives are extracted into `/opt` at runtime, so the directory's
     * layout must match the runtime's convention (e.g. `nodejs/node_modules`
     * for Node.js dependencies, `bin/` for executables). File modes are
     * preserved, so executables keep their `+x` bit.
     *
     * Exactly one of `path` or {@link s3} is required.
     */
    path?: string;
    /**
     * Layer content already uploaded to S3. Required for archives above the
     * 50 MB direct-upload limit.
     *
     * Exactly one of {@link path} or `s3` is required.
     */
    s3?: LayerVersionS3Content;
    /**
     * Description of this version of the layer.
     */
    description?: string;
    /**
     * Runtimes the layer is compatible with. Used to filter the layer in the
     * console; Lambda does not enforce it.
     */
    compatibleRuntimes?: lambda.Runtime[];
    /**
     * Instruction set architectures the layer is compatible with.
     */
    compatibleArchitectures?: lambda.Architecture[];
    /**
     * The layer's software license — an SPDX identifier, a URL, or the full
     * license text.
     */
    licenseInfo?: string;
}
export interface LayerVersion extends Resource<"AWS.Lambda.LayerVersion", LayerVersionProps, {
    /**
     * Name of the layer.
     */
    layerName: string;
    /**
     * ARN of the layer (without a version suffix).
     */
    layerArn: string;
    /**
     * ARN of this specific layer version. This is what
     * {@link FunctionProps.layers} takes.
     */
    layerVersionArn: string;
    /**
     * Version number assigned by Lambda.
     */
    version: number;
    /**
     * Hash of the packaged content and publish configuration. Any change to
     * it publishes a new version, since layer versions are immutable.
     */
    sourceHash: string;
    /**
     * Base64-encoded SHA-256 of the layer archive, as reported by Lambda.
     */
    codeSha256?: string;
    /**
     * Size of the layer archive in bytes.
     */
    codeSize?: number;
    /**
     * Date the version was created, in ISO-8601 format.
     */
    createdDate?: string;
    /**
     * Description of the version.
     */
    description?: string;
    /**
     * Runtimes the layer is compatible with.
     */
    compatibleRuntimes?: lambda.Runtime[];
    /**
     * Architectures the layer is compatible with.
     */
    compatibleArchitectures?: lambda.Architecture[];
    /**
     * The layer's software license.
     */
    licenseInfo?: string;
}, never, Providers> {
}
/**
 * A version of a Lambda layer — a zip archive of libraries, a custom runtime,
 * or other dependencies that Lambda extracts into `/opt` alongside your
 * function code.
 *
 * Layer versions are immutable, so changing the content or any publish
 * setting publishes a new version under the same layer and retires the one
 * it supersedes. `layerVersionArn` and `version` therefore change on update;
 * `layerName` and `layerArn` stay put.
 *
 * ### Publishing a Layer
 * **Example:** Package a Local Directory
 * ```typescript
 * // ./layers/deps contains nodejs/node_modules/...
 * const deps = yield* LayerVersion("Deps", {
 *   path: "./layers/deps",
 *   compatibleRuntimes: ["nodejs22.x"],
 * });
 * ```
 *
 * **Example:** Publish an Existing Archive
 * ```typescript
 * const layer = yield* LayerVersion("Ffmpeg", {
 *   path: "./dist/ffmpeg-layer.zip",
 *   description: "static ffmpeg build",
 *   compatibleArchitectures: ["arm64"],
 * });
 * ```
 *
 * **Example:** Publish From S3
 * ```typescript
 * const layer = yield* LayerVersion("BigLayer", {
 *   s3: {
 *     bucket,
 *     key: "layers/big-layer.zip",
 *   },
 * });
 * ```
 *
 * ### Attaching to a Function
 * **Example:** Use a Layer in a Function
 * ```typescript
 * const fn = yield* Function("Handler", {
 *   main: import.meta.resolve("./handler.ts"),
 *   layers: [deps],
 * });
 * ```
 *
 * @resource
 */
export declare const LayerVersion: import("../../Resource.ts").ResourceClass<LayerVersion>;
export declare const LayerVersionProvider: () => import("effect/Layer").Layer<Provider.Provider<LayerVersion>, never, import("@distilled.cloud/aws/Credentials").Credentials | FileSystem.FileSystem | import("effect/unstable/http/HttpClient").HttpClient | Path.Path | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=LayerVersion.d.ts.map