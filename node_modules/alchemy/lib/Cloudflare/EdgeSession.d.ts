import { Credentials } from "@distilled.cloud/cloudflare/Credentials";
import * as workers from "@distilled.cloud/cloudflare/workers";
import * as Effect from "effect/Effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import { Access } from "./Access.ts";
import { CloudflareEnvironment } from "./CloudflareEnvironment.ts";
/**
 * A "remote binding" as understood by the Cloudflare Workers
 * edge-preview API. We reuse the distilled request schema so the
 * shape tracks Cloudflare's surface.
 */
type EdgeMetadata = NonNullable<NonNullable<workers.CreateScriptEdgePreviewRequest["metadata"]>>;
export type EdgeBinding = NonNullable<NonNullable<EdgeMetadata["bindings"]>>[number];
declare const EdgeSessionError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "EdgeSessionError";
} & Readonly<A>;
export declare class EdgeSessionError extends EdgeSessionError_base<{
    readonly message: string;
    readonly cause?: unknown;
}> {
}
export interface EdgeSessionOptions {
    /**
     * Name used as the preview script identifier on Cloudflare's side.
     * Shows up as the hostname: `{scriptName}.{subdomain}.workers.dev`.
     */
    readonly scriptName: string;
    /** ES-module worker script(s). The first file is the entrypoint. */
    readonly files: ReadonlyArray<File>;
    /** Remote bindings attached to the preview worker. */
    readonly bindings: ReadonlyArray<EdgeBinding>;
    /** @default "2026-08-31" */
    readonly compatibilityDate?: string;
}
/**
 * Information needed to call a running edge-preview worker. Attach
 * `headers` (including the `cf-workers-preview-token`) and fetch
 * `url` or a path under it.
 */
export interface EdgeSessionHandle {
    readonly url: string;
    readonly headers: Record<string, string>;
}
/**
 * Upload a short-lived preview worker to Cloudflare's edge and
 * return its URL plus the headers needed to reach it.
 *
 * Preview workers are ephemeral: they live only while a client keeps
 * sending requests with the returned preview token and expire soon
 * after. Nothing is deployed or billed.
 */
export declare const createEdgeSession: (options: EdgeSessionOptions) => Effect.Effect<EdgeSessionHandle, EdgeSessionError, CloudflareEnvironment | HttpClient.HttpClient | Credentials | Access>;
export {};
//# sourceMappingURL=EdgeSession.d.ts.map