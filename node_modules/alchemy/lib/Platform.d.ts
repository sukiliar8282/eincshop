/** @effect-diagnostics anyUnknownInErrorContext:off */
import type { NodeServices } from "@effect/platform-node/NodeServices";
import * as ConfigError from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Scope } from "effect/Scope";
import type * as Stream from "effect/Stream";
import type { HttpClient } from "effect/unstable/http/HttpClient";
import type { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
import type { Dependencies } from "./Dependencies.ts";
import type { HttpEffect } from "./Http.ts";
import type { InputProps } from "./Input.ts";
import type { Named, Tag } from "./Named.ts";
import type { Provider, ProviderCollectionLike } from "./Provider.ts";
import { type ResourceLike } from "./Resource.ts";
import type { Rpc } from "./Rpc.ts";
import { RuntimeContext, type BaseRuntimeContext } from "./RuntimeContext.ts";
import type { Stack, StackServices } from "./Stack.ts";
import type { Stage } from "./Stage.ts";
export interface PlatformProps {
    /**
     * @internal type used to signal when this is an effect-native implementation
     * @default false
     */
    isExternal?: boolean;
}
export type Main<InitServices = never> = void | {
    fetch?: HttpEffect<InitServices | PlatformServices | RuntimeContext | Scope> | Effect.Effect<HttpEffect<InitServices | PlatformServices | RuntimeContext | Scope>, never, InitServices | PlatformServices>;
};
export interface MainRpc<Req = never> {
    [key: string]: Effect.Effect<any, any, PlatformServices | RuntimeContext | HttpServerRequest | Scope | Req> | Stream.Stream<any, any, PlatformServices | RuntimeContext | HttpServerRequest | Scope | Req> | ((...args: any[]) => Effect.Effect<any, any, PlatformServices | RuntimeContext | Scope | Req> | Stream.Stream<any, any, PlatformServices | RuntimeContext | Scope | Req>);
}
export type MakeShape<Shape, BaseShape> = [
    Exclude<Shape, void | undefined>
] extends [never] ? Exclude<BaseShape, void | undefined> : Exclude<Shape, void | undefined> & Exclude<BaseShape, void | undefined>;
export type PlatformServices = NodeServices | HttpClient | Provider<any> | ProviderCollectionLike | Stack | StackServices | Stage;
export interface Platform<Resource extends ResourceLike<string, PlatformProps>, Services, MainShape, RuntimeContext extends BaseRuntimeContext, BaseShape = {}, InlineProps extends Resource["Props"] = Resource["Props"]> extends Effect.Effect<Resource & RuntimeContext, never, Resource> {
    Type: Resource["Type"];
    Provider: Provider<Resource>;
    <Self, Shape, Deps = never>(): {
        <const Id extends string>(id: Id): Effect.Effect<Resource & Rpc<Self> & Dependencies<Deps>, never, Resource["Providers"]> & Named<Id> & {
            make<PropsReq = never, InitReq = never>(props: InputProps<InlineProps> | Effect.Effect<InputProps<InlineProps>, ConfigError.ConfigError, PropsReq>, impl: Effect.Effect<Shape, ConfigError.ConfigError, InitReq>): Layer.Layer<Self, never, Resource["Providers"] | Exclude<PropsReq | InitReq, Services | PlatformServices | Resource>>;
            new (_: never): MakeShape<Shape, BaseShape> & Named<Id> & Tag<Resource["Type"]>;
            of(shape: Shape & MainShape): MakeShape<Shape, BaseShape>;
        };
    };
    <Self>(): {
        <const Id extends string, Shape extends MainShape, PropsReq = never, InitReq extends Services | PlatformServices | Resource = never>(id: Id, props: InputProps<InlineProps> | Effect.Effect<InputProps<InlineProps>, ConfigError.ConfigError, PropsReq>, impl: Effect.Effect<Shape, ConfigError.ConfigError, InitReq>): Effect.Effect<Resource & Rpc<Self>, never, Resource["Providers"] | Exclude<PropsReq, Services | PlatformServices | Resource> | Exclude<InitReq, Services | PlatformServices | Resource>> & Named<Id> & {
            new (_: never): MakeShape<Shape, BaseShape> & Named<Id> & Tag<Resource["Type"]>;
        };
        <const Id extends string>(id: Id): Effect.Effect<Resource & Rpc<Self>, never, Resource["Providers"]> & Named<Id> & {
            make<PropsReq = never, InitReq extends Services | PlatformServices | Resource = never>(props: InputProps<InlineProps> | Effect.Effect<InputProps<InlineProps>, ConfigError.ConfigError, PropsReq>, impl: Effect.Effect<MainShape, ConfigError.ConfigError, InitReq>): Layer.Layer<Self, never, Resource["Providers"] | Exclude<PropsReq | InitReq, Services | PlatformServices | Resource>>;
            new (_: never): BaseShape & Named<Id> & Tag<Resource["Type"]>;
        };
    };
    <PropsReq = never, InitReq extends Services | PlatformServices = never>(id: string, props: InputProps<Resource["Props"]> | Effect.Effect<InputProps<Resource["Props"]>, never, PropsReq>): Effect.Effect<Resource, never, Resource["Providers"] | PropsReq | Exclude<InitReq, Services | PlatformServices>>;
    <const Id extends string, Shape extends MainShape, PropsReq = never, InitReq extends Services | PlatformServices = never>(id: Id, props: InputProps<InlineProps> | Effect.Effect<InputProps<InlineProps>, never, PropsReq>, impl: Effect.Effect<Shape, ConfigError.ConfigError, InitReq>): Effect.Effect<Resource & Rpc<Shape> & Named<Id>, never, Resource["Providers"] | PropsReq | Exclude<InitReq, Services | PlatformServices>> & Named<Id>;
}
export declare const Platform: <R extends ResourceLike<string, {
    env?: Record<string, any>;
    exports?: string[] | Record<string, any>;
} | undefined>>(type: R["Type"], hooks: {
    createRuntimeContext: (id: string) => BaseRuntimeContext;
    /**
     * Legacy type names this platform's resource was previously registered
     * under (see `ResourceOptions.aliases`) — threaded to the underlying
     * `Resource` so state persisted under a pre-rename type keeps
     * resolving.
     */
    aliases?: string[];
    onCreate?: (resource: R, props: any) => Effect.Effect<void, never, any>;
    /**
     * Transform the user-supplied props before the underlying resource is
     * declared. Runs in the resource-construction context (Stack, Namespace,
     * and providers are available), so the hook may compose REAL child
     * resources (the `StaticSite` pattern) and return derived props that
     * reference their Outputs. Implementations MUST be a no-op at runtime
     * (guard on `globalThis.__ALCHEMY_RUNTIME__`) — the hook is evaluated
     * wherever the props effect is, including inside deployed bundles.
     */
    transformProps?: (id: string, props: any) => Effect.Effect<any, any, any>;
}, methods?: {
    [key: string]: any;
}) => any;
//# sourceMappingURL=Platform.d.ts.map