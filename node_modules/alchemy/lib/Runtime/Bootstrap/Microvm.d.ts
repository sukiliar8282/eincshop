import * as Layer from "effect/Layer";
export interface MicrovmBootstrapOptions {
    /** Port to serve on when the VM does not inject `PORT`. */
    readonly port: number;
    /** Stack identity baked in at deploy time. */
    readonly stack: {
        readonly name: string;
        readonly stage: string;
    };
}
export interface MicrovmRuntime {
    /** `BunServices.layer` / `NodeServices.layer`. */
    readonly services: Layer.Layer<any>;
    /** `BunHttpServer()` / `NodeHttpServer()`; both listen on `PORT`. */
    readonly httpServer: Layer.Layer<any, any, any>;
}
/** Serve the bundled in-VM program on the runtime's HTTP server. */
export declare const bootstrapMicrovm: (runtime: MicrovmRuntime, entrypoint: unknown, options: MicrovmBootstrapOptions) => Promise<void>;
//# sourceMappingURL=Microvm.d.ts.map