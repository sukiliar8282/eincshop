import * as EffectContext from "effect/Context";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
declare const AlchemyContext_base: EffectContext.ServiceClass<AlchemyContext, "alchemy/Context", {
    dotAlchemy: string;
    dev: boolean;
    /**
     * Global default for the {@link import("./AdoptPolicy.ts").AdoptPolicy}
     * service. When `true`, resources without prior state will be adopted by
     * calling their `read` lifecycle operation; if that returns attributes
     * (and does not fail with `OwnedBySomeoneElse`), those attributes are
     * persisted as the resource's initial `created` state.
     *
     * The CLI's `--adopt` flag flows in through this field. Per-resource
     * overrides via the `adopt(enabled)` combinator still take precedence.
     */
    adopt: boolean;
    /**
     * When `true`, an out-of-date Cloudflare state store is upgraded
     * automatically instead of prompting for confirmation (and the upgrade
     * proceeds even in CI). The CLI's `--yes` flag flows in through this field.
     * @default false
     */
    updateStateStore?: boolean;
}>;
export declare class AlchemyContext extends AlchemyContext_base {
}
export declare const AlchemyContextLive: Layer.Layer<AlchemyContext, import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
export {};
//# sourceMappingURL=AlchemyContext.d.ts.map