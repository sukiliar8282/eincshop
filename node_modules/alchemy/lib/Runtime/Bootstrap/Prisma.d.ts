export interface PrismaBootstrapOptions {
    /** Port to serve on when the platform does not inject `PORT`. */
    readonly port: number;
    /** Stack identity baked in at deploy time. */
    readonly stack: {
        readonly name: string;
        readonly stage: string;
    };
}
/** Serve the bundled app with a Bun HTTP server on `PORT` (all interfaces). */
export declare const bootstrap: (entrypoint: unknown, options: PrismaBootstrapOptions) => Promise<void>;
//# sourceMappingURL=Prisma.d.ts.map