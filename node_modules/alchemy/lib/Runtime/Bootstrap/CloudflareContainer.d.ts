import * as Layer from "effect/Layer";
export interface ContainerBootstrapOptions {
    /** Stack identity baked in at deploy time. */
    readonly stack: {
        readonly name: string;
        readonly stage: string;
    };
}
export interface ContainerRuntime {
    /** `BunServices.layer` / `NodeServices.layer`. */
    readonly services: Layer.Layer<any>;
    /** `BunHttpServer()` / `NodeHttpServer()`. */
    readonly httpServer: Layer.Layer<any, any, any>;
}
/** Serve the bundled container program on the runtime's HTTP server. */
export declare const bootstrapContainer: (runtime: ContainerRuntime, entrypoint: unknown, options: ContainerBootstrapOptions) => Promise<void>;
//# sourceMappingURL=CloudflareContainer.d.ts.map