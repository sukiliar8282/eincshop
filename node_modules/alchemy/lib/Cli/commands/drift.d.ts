import * as Option from "effect/Option";
import * as Command from "effect/unstable/cli/Command";
import { Cli } from "../../Report.ts";
import * as CliKit from "../CliKit/index.ts";
export declare const driftCommand: Command.Command<"drift", {
    readonly repair: boolean;
    readonly main: string;
    readonly envFile: Option.Option<string>;
    readonly stage: string | undefined;
    readonly profile: string | undefined;
}, {}, any, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | Cli | CliKit.CliKit | import("../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
//# sourceMappingURL=drift.d.ts.map