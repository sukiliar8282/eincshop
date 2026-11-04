import type { WorkerProps } from "./Worker.ts";
/**
 * Compatibility settings passed to build tools and framework adapters.
 * Cloudflare rejects a redundant `nodejs_compat` flag after its default-on
 * date, but downstream tools may still detect Node support from the explicit
 * flag only, so internal build configuration materializes the effective flag.
 */
export declare const getToolingCompatibility: (compatibility: {
    date: string;
    flags: string[];
}, main: unknown) => {
    date: string;
    flags: string[];
};
export declare const getCompatibility: (props: WorkerProps) => {
    date: string;
    flags: string[];
};
//# sourceMappingURL=Compatibility.d.ts.map