import * as Server from "../../Server/index.ts";
export declare const MicrovmImageTypeId: "AWS.Lambda.MicrovmImage";
/**
 * Runtime context for the in-VM process: an HTTP server (the MicroVM endpoint)
 * that exposes the impl's `fetch` handler plus any RPC shape methods. Mirrors
 * the Cloudflare `ContainerPlatform` process context.
 */
export declare const makeMicrovmRuntimeContext: (id: string) => Server.ProcessContext;
//# sourceMappingURL=MicrovmRuntimeContext.d.ts.map