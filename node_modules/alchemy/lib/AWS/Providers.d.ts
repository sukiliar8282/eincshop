import { Retry } from "@distilled.cloud/aws/Retry";
import * as Layer from "effect/Layer";
import * as Command from "../Command/index.ts";
import { KeyPair } from "../KeyPair.ts";
import * as Provider from "../Provider.ts";
import { Random } from "../Random.ts";
import * as Assets from "./Assets.ts";
import * as Credentials from "./Credentials.ts";
import * as EC2 from "./EC2/index.ts";
import * as Region from "./Region.ts";
declare const Providers_base: Provider.ProviderCollection<Providers, "AWS">;
export declare class Providers extends Providers_base {
}
export declare const providers: () => Layer.Layer<import("./Environment.ts").AWSEnvironment | Assets.Assets | import("../Kubernetes/ClusterAdapter.ts").ClusterAdapterService | Credentials.Credentials | import("../Auth/Credentials.ts").CredentialsStore | import("../Docker/Docker.ts").Docker | EC2.GetAmi | Provider.Provider<Command.Build> | Provider.Provider<Command.Dev> | Provider.Provider<Command.Exec> | Provider.Provider<KeyPair> | Provider.Provider<Random> | Providers | Region.Region | Retry, never, any>;
export {};
//# sourceMappingURL=Providers.d.ts.map