import * as Option from "effect/Option";
import { Command } from "effect/unstable/cli";
export declare const logsCommand: Command.Command<"logs", {
    readonly main: string;
    readonly envFile: Option.Option<string>;
    readonly stage: string | undefined;
    readonly profile: string | undefined;
    readonly resources: string | undefined;
    readonly limit: number;
    readonly since: string | undefined;
    readonly tail: boolean;
}, {}, any, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
//# sourceMappingURL=logs.d.ts.map