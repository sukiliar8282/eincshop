import * as Effect from "effect/Effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import { RailwayEnvironment } from "./Environment.ts";
declare const DeployUploadFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Railway.DeployUploadFailed";
} & Readonly<A>;
export declare class DeployUploadFailed extends DeployUploadFailed_base<{
    status: number;
    message: string;
}> {
}
export type UpResponse = {
    readonly deploymentId: string;
    readonly url: string;
    readonly logsUrl: string;
    readonly deploymentDomain: string;
};
/**
 * Upload a gzipped tar of a generated Docker context. Railway builds
 * and deploys it. Same contract as `railway up`.
 */
export declare const uploadDeployTarball: (input: {
    projectId: string;
    environmentId: string;
    serviceId: string;
    tarball: Uint8Array;
    message?: string;
}) => Effect.Effect<UpResponse, DeployUploadFailed | import("effect/unstable/http/HttpClientError").HttpClientError, HttpClient.HttpClient | RailwayEnvironment>;
export {};
//# sourceMappingURL=Up.d.ts.map