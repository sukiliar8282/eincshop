import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { CredentialsStoreLive } from "../Auth/Credentials.js";
import { ProfileStoreLive } from "../Auth/Profile.js";
import * as Command from "../Command/index.js";
import * as Provider from "../Provider.js";
import { HetznerAuth } from "./AuthProvider.js";
import { Certificate, CertificateProvider } from "./Certificate.js";
import * as Credentials from "./Credentials.js";
import { fromCredentials } from "./Environment.js";
import { Firewall, FirewallProvider } from "./Firewall.js";
import { FloatingIp, FloatingIpProvider } from "./FloatingIp.js";
import { FloatingIpAssignment, FloatingIpAssignmentProvider, } from "./FloatingIpAssignment.js";
import { Image, ImageProvider } from "./Image.js";
import { LoadBalancer, LoadBalancerProvider } from "./LoadBalancer.js";
import { Network, NetworkProvider } from "./Network.js";
import { PlacementGroup, PlacementGroupProvider } from "./PlacementGroup.js";
import { PrimaryIp, PrimaryIpProvider } from "./PrimaryIp.js";
import { ReadDnsHttp } from "./ReadDnsHttp.js";
import { ReadWriteDnsHttp } from "./ReadWriteDnsHttp.js";
import { MountVolumeLive } from "./MountVolume.js";
import { RecordSet, RecordSetProvider } from "./RecordSet.js";
import { Server, ServerProvider } from "./Server.js";
import { Service, ServiceProvider } from "./Service.js";
import { SshLive } from "./Ssh.js";
import { WriteDnsHttp } from "./WriteDnsHttp.js";
import { SshKey, SshKeyProvider } from "./SshKey.js";
import { Volume, VolumeProvider } from "./Volume.js";
import { VolumeAttachment, VolumeAttachmentProvider, } from "./VolumeAttachment.js";
import { Zone, ZoneProvider } from "./Zone.js";
import { Server as WebsiteServer, ServerProvider as WebsiteServerProvider, } from "../Website/Server.js";
export class Providers extends Provider.ProviderCollection()("Hetzner") {
}
/**
 * Build a layer that registers all Hetzner resource providers, the Hetzner
 * `AuthProvider`, the resolved `Credentials`, and an `HttpClient`. Include
 * this from your stack alongside other cloud `providers()` layers.
 *
 * Resource providers are inserted into {@link Provider.collection} as they
 * land.
 *
 * @example
 * ```typescript
 * import * as Alchemy from "alchemy";
 * import * as Hetzner from "alchemy/Hetzner";
 * import * as Effect from "effect/Effect";
 *
 * export default Alchemy.Stack(
 *   "MyStack",
 *   {
 *     providers: Hetzner.providers(),
 *     state: Alchemy.localState(),
 *   },
 *   Effect.gen(function* () {
 *     return {};
 *   }),
 * );
 * ```
 */
export const providers = () => Layer.effect(Providers, Provider.collection([
    Certificate,
    Firewall,
    FloatingIp,
    FloatingIpAssignment,
    Image,
    LoadBalancer,
    Network,
    PlacementGroup,
    PrimaryIp,
    RecordSet,
    Server,
    Service,
    SshKey,
    Volume,
    VolumeAttachment,
    WebsiteServer,
    Zone,
])).pipe(Layer.provide(Layer.mergeAll(CertificateProvider(), FirewallProvider(), FloatingIpProvider(), FloatingIpAssignmentProvider(), ImageProvider(), LoadBalancerProvider(), NetworkProvider(), PlacementGroupProvider(), PrimaryIpProvider(), RecordSetProvider(), ServerProvider(), ServiceProvider(), SshKeyProvider(), VolumeProvider(), VolumeAttachmentProvider(), WebsiteServerProvider(), ZoneProvider())), Layer.provideMerge(ReadDnsHttp), Layer.provideMerge(WriteDnsHttp), Layer.provideMerge(ReadWriteDnsHttp), Layer.provideMerge(SshLive), Layer.provideMerge(MountVolumeLive), Layer.provideMerge(fromCredentials()), Layer.provideMerge(Credentials.fromAuthProvider()), Layer.provideMerge(HetznerAuth), Layer.provideMerge(ProfileStoreLive), Layer.provideMerge(CredentialsStoreLive), Layer.provideMerge(FetchHttpClient.layer), Layer.provideMerge(Command.providers()), Layer.orDie);
//# sourceMappingURL=Providers.js.map