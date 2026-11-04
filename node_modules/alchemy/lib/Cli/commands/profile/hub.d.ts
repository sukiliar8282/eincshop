import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { CliKit } from "../../CliKit/index.ts";
export declare const profileHub: (options: {
    envFile: Option.Option<string>;
    main: string;
}) => Effect.Effect<void, import("../../../Interaction.ts").NonInteractiveTerminal | import("effect/PlatformError").PlatformError | import("../../../Auth/Profile.ts").ProfileError, import("../../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CliKit | import("../../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
//# sourceMappingURL=hub.d.ts.map