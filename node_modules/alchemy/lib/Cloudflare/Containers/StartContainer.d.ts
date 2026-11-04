import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { type Container, type ContainerStartupOptions } from "./Container.ts";
export declare const layer: <Image extends Container.Decl.Any>(container: Image, options?: ContainerStartupOptions) => Layer.Layer<InstanceType<Image>>;
/**
 * Runs the Container in a Durable Object and monitors it, providing a durable fetch and RPC interface to it.
 */
export declare const startContainer: <Image extends Container.Decl.Any>(containerEff: Image, options?: import("@cloudflare/workers-types").ContainerStartupOptions | undefined) => Effect.Effect<Container.Instance<InstanceType<Image>>, never, any>;
//# sourceMappingURL=StartContainer.d.ts.map