import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { CredentialsStoreLive } from "../Auth/Credentials.js";
import { ProfileStoreLive } from "../Auth/Profile.js";
import * as Command from "../Command/index.js";
import * as Provider from "../Provider.js";
import { App, AppProvider } from "./App.js";
import { FlyAuth } from "./AuthProvider.js";
import { Bucket, BucketProvider } from "./Bucket.js";
import { DeleteObjectHttp } from "./DeleteObjectHttp.js";
import { GetObjectHttp } from "./GetObjectHttp.js";
import { HeadObjectHttp } from "./HeadObjectHttp.js";
import { ListObjectsV2Http } from "./ListObjectsV2Http.js";
import { PutObjectHttp } from "./PutObjectHttp.js";
import { ReadRedisHttp } from "./ReadRedisHttp.js";
import { ReadWriteRedisHttp } from "./ReadWriteRedisHttp.js";
import { WriteRedisHttp } from "./WriteRedisHttp.js";
import { Certificate, CertificateProvider } from "./Certificate.js";
import { CheckpointHttp } from "./CheckpointHttp.js";
import * as Credentials from "./Credentials.js";
import { fromCredentials } from "./Environment.js";
import { IpAssignment, IpAssignmentProvider } from "./IpAssignment.js";
import { Machine, MachineProvider } from "./Machine.js";
import { ConnectPostgresHttp } from "./ConnectPostgresHttp.js";
import { Postgres, PostgresProvider } from "./Postgres.js";
import { Redis, RedisProvider } from "./Redis.js";
import { DecryptHttp } from "./DecryptHttp.js";
import { EncryptHttp } from "./EncryptHttp.js";
import { ExecHttp } from "./ExecHttp.js";
import { GetSecretHttp } from "./GetSecretHttp.js";
import { ListSecretsHttp } from "./ListSecretsHttp.js";
import { MountVolumeLive } from "./MountVolume.js";
import { Secret, SecretProvider } from "./Secret.js";
import { SecretKey, SecretKeyProvider } from "./SecretKey.js";
import { Service, ServiceProvider } from "./Service.js";
import { AssetDeployment, AssetDeploymentProvider, } from "./Website/AssetDeployment.js";
import { Server as WebsiteServer, ServerProvider as WebsiteServerProvider, } from "../Website/Server.js";
import { SignHttp } from "./SignHttp.js";
import { Sprite, SpriteProvider } from "./Sprite.js";
import { VerifyHttp } from "./VerifyHttp.js";
import { VolumeSnapshot, VolumeSnapshotProvider } from "./VolumeSnapshot.js";
import { WriteSecretHttp } from "./WriteSecretHttp.js";
export class Providers extends Provider.ProviderCollection()("Fly") {
}
/**
 * Build a layer that registers Fly resource providers, the Fly
 * `AuthProvider`, the resolved `Credentials`, and an `HttpClient`. Include
 * this from your stack alongside other cloud `providers()` layers.
 *
 * Resource providers are inserted into {@link Provider.collection} as they
 * land. The collection starts empty so App / Machine / Service agents can
 * make a single minimal insertion.
 *
 * @example
 * ```typescript
 * import * as Alchemy from "alchemy";
 * import * as Fly from "alchemy/Fly";
 * import * as Effect from "effect/Effect";
 *
 * export default Alchemy.Stack(
 *   "MyStack",
 *   {
 *     providers: Fly.providers(),
 *     state: Alchemy.localState(),
 *   },
 *   Effect.gen(function* () {
 *     return {};
 *   }),
 * );
 * ```
 */
export const providers = () => Layer.effect(Providers, Provider.collection([
    App,
    AssetDeployment,
    Bucket,
    Certificate,
    IpAssignment,
    Machine,
    Postgres,
    Redis,
    Secret,
    SecretKey,
    Service,
    Sprite,
    VolumeSnapshot,
    WebsiteServer,
])).pipe(Layer.provide(Layer.mergeAll(AppProvider(), AssetDeploymentProvider(), BucketProvider(), CertificateProvider(), IpAssignmentProvider(), MachineProvider(), PostgresProvider(), RedisProvider(), SecretProvider(), SecretKeyProvider(), ServiceProvider(), SpriteProvider(), VolumeSnapshotProvider(), WebsiteServerProvider())), 
// The binding layers are mutually independent — they all draw on the
// Credentials/HttpClient layers below. Merge them into one group so
// `.pipe` stays under its 20-argument overload ceiling.
Layer.provideMerge(Layer.mergeAll(MountVolumeLive, ConnectPostgresHttp, PutObjectHttp, GetObjectHttp, DeleteObjectHttp, HeadObjectHttp, ListObjectsV2Http, ReadRedisHttp, WriteRedisHttp, ReadWriteRedisHttp, CheckpointHttp, ExecHttp, GetSecretHttp, ListSecretsHttp, WriteSecretHttp, EncryptHttp, DecryptHttp, SignHttp, VerifyHttp)), Layer.provideMerge(fromCredentials()), Layer.provideMerge(Credentials.fromAuthProvider()), Layer.provideMerge(FlyAuth), Layer.provideMerge(ProfileStoreLive), Layer.provideMerge(CredentialsStoreLive), Layer.provideMerge(FetchHttpClient.layer), Layer.provideMerge(Command.providers()), Layer.orDie);
//# sourceMappingURL=Providers.js.map