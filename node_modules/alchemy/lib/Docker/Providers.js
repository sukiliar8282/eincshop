import * as Layer from "effect/Layer";
import * as Provider from "../Provider.js";
import { Container, ContainerProvider } from "./Container.js";
import { Context, ContextProvider } from "./Context.js";
import { DockerLive } from "./Docker.js";
import { Image, ImageProvider } from "./Image.js";
import { Network, NetworkProvider } from "./Network.js";
import { RemoteImage, RemoteImageProvider } from "./RemoteImage.js";
import { Service, ServiceProvider } from "./Service.js";
import { Swarm, SwarmProvider } from "./Swarm.js";
import { Volume, VolumeProvider } from "./Volume.js";
export class Providers extends Provider.ProviderCollection()("Docker") {
}
/**
 * Registers all Docker resource providers.
 *
 * Docker providers use the active Docker CLI context and are intentionally
 * separate from `Cloudflare.Container`.
 */
export const providers = () => Layer.effect(Providers, Provider.collection([
    Container,
    Image,
    Network,
    RemoteImage,
    Volume,
    Context,
    Service,
    Swarm,
])).pipe(Layer.provide(Layer.mergeAll(ContainerProvider(), ImageProvider(), NetworkProvider(), RemoteImageProvider(), VolumeProvider(), ContextProvider(), ServiceProvider(), SwarmProvider())), Layer.provideMerge(DockerLive));
//# sourceMappingURL=Providers.js.map