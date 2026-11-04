import * as Option from "effect/Option";
import * as Command from "effect/unstable/cli/Command";
import { Cli } from "../../Report.ts";
import * as CliKit from "../CliKit/index.ts";
export declare const deployCommand: Command.Command<"deploy", {
    readonly dryRun: boolean;
    readonly force: boolean;
    readonly config: string | undefined;
    readonly configPath: string | undefined;
    readonly envFile: Option.Option<string>;
    readonly stage: string | undefined;
    readonly yes: boolean;
    readonly profile: string | undefined;
    readonly adopt: boolean;
    readonly detailed: boolean;
    readonly detectDrift: boolean;
}, {}, any, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | Cli | CliKit.CliKit | import("../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
export declare const destroyCommand: Command.Command<"destroy", {
    readonly dryRun: boolean;
    readonly config: string | undefined;
    readonly configPath: string | undefined;
    readonly envFile: Option.Option<string>;
    readonly stage: string | undefined;
    readonly yes: boolean;
    readonly profile: string | undefined;
}, {}, any, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | Cli | CliKit.CliKit | import("../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
export declare const planCommand: Command.Command<"plan", {
    readonly config: string | undefined;
    readonly configPath: string | undefined;
    readonly envFile: Option.Option<string>;
    readonly stage: string | undefined;
    readonly profile: string | undefined;
    readonly detailed: boolean;
}, {}, any, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | Cli | CliKit.CliKit | import("../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
//# sourceMappingURL=deploy.d.ts.map