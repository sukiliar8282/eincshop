import type { ResourceLike } from "./Resource.ts";
export declare const isRef: (s: any) => s is Ref<any>;
export declare const getRefMetadata: <R extends ResourceLike>(ref: Ref<R>) => RefMetadata<R>;
export interface Ref<R extends ResourceLike = ResourceLike> {
    /** @internal phantom */
    Ref: R;
}
export interface RefMetadata<R extends ResourceLike> {
    id: R["LogicalId"];
    stack?: string;
    stage?: string;
    /**
     * The resource type of the ref's target (e.g.
     * `"Cloudflare.KV.Namespace"`). Known statically — `MyResource.ref`
     * carries its own type — so duck-typing classifiers (Worker env
     * bindings, capability helpers) that read `.Type` can identify a ref
     * exactly like a locally-declared resource.
     */
    type?: string;
}
export declare const ref: <R extends ResourceLike>(id: string, { stack, stage, }?: {
    stack?: string;
    stage?: string;
}, type?: string) => Ref<R>;
//# sourceMappingURL=Ref.d.ts.map