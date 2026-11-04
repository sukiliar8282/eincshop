import * as Option from "effect/Option";
import { Command } from "effect/unstable/cli";
import * as CliKit from "../../Cli/CliKit/index.ts";
export declare const stateCommand: Command.Command<"state", {} | {
    readonly main: string;
    readonly envFile: Option.Option<string>;
    readonly profile: string | undefined;
    readonly backend: "aws" | "cloudflare" | "configured" | "local";
}, {}, unknown, import("../../AlchemyContext.ts").AlchemyContext | import("../../Artifacts.ts").ArtifactStore | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CliKit.CliKit | import("../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
//# sourceMappingURL=state.d.ts.map