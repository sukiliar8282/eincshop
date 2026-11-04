import * as Layer from "effect/Layer";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Bucket } from "../Bucket.ts";
import type { Providers } from "../Providers.ts";
export interface AssetDeploymentProps {
    /**
     * Destination Tigris bucket (a {@link Bucket} resource).
     */
    bucket: Bucket;
    /**
     * Local directory to upload (framework `clientDirectory`).
     */
    sourcePath: string;
    /**
     * Optional key prefix within the bucket.
     */
    prefix?: string;
    /**
     * Delete observed keys under the prefix that are not in this deploy.
     * @default true
     */
    purge?: boolean;
}
export interface AssetDeployment extends Resource<"Fly.Website.AssetDeployment", AssetDeploymentProps, {
    bucketName: string;
    prefix: string;
    version: string;
    fileCount: number;
    files: string[];
}, never, Providers> {
}
/**
 * Upload a local directory into a public Tigris bucket for Fly Website
 * statics. HTML is never cached; everything else is immutable.
 *
 * @resource
 */
export declare const AssetDeployment: import("../../Resource.ts").ResourceClass<AssetDeployment>;
export declare const AssetDeploymentProvider: () => Layer.Layer<Provider.Provider<AssetDeployment>, never, FileSystem.FileSystem | Path.Path>;
//# sourceMappingURL=AssetDeployment.d.ts.map