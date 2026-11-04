import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as CliKit from "../../../Cli/CliKit/index.ts";
export declare const profileTui: Effect.Effect<typeof import("../../../Cli/components/view/Profile.tsx"), never, never>;
export type EditAction = "add" | "reconfigure" | "remove";
export interface EditOutcome {
    readonly provider: string;
    readonly action: EditAction;
    readonly outcome: "done" | "skipped";
}
export declare const showProfileFlow: (options: {
    profileName: string;
    activeProfile: string;
    envFile: Option.Option<string>;
    main: string;
}) => Effect.Effect<void, import("../../../Alchemist/Errors.ts").AlchemistNotFound | import("../../../Auth/AuthProvider.ts").AuthError | import("effect/PlatformError").PlatformError | import("../../../Auth/Profile.ts").ProfileError, import("../../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("../../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
export declare const renameProfileFlow: (name: string, suppliedNewName: string | undefined) => Effect.Effect<string, import("../../../Alchemist/Errors.ts").AlchemistNotFound | import("../../../Auth/AuthProvider.ts").AuthError | import("effect/PlatformError").PlatformError | import("../../../Auth/Profile.ts").ProfileError | CliKit.InteractionError, import("../../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CliKit.CliKit | import("../../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
export declare const deleteProfileFlow: (options: {
    name: string;
    envFile: Option.Option<string>;
    main: string;
    yes: boolean;
}) => Effect.Effect<boolean, import("../../../Alchemist/Errors.ts").AlchemistNotFound | import("../../../Auth/AuthProvider.ts").AuthError | import("../confirm.ts").ConfirmationDeclined | import("effect/PlatformError").PlatformError | import("../../../Auth/Profile.ts").ProfileError | CliKit.InteractionError, import("../../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CliKit.CliKit | import("../../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
export declare const editProfileFlow: (options: {
    selectedProfile: string;
    add: ReadonlyArray<string>;
    reconfigure: ReadonlyArray<string>;
    remove: ReadonlyArray<string>;
    envFile: Option.Option<string>;
    main: string;
    configureInput?: {
        method?: string;
        values: Record<string, string>;
    };
}) => Effect.Effect<EditOutcome[], import("../../../Alchemist/Errors.ts").AlchemistInvalidInput | import("../../../Alchemist/Errors.ts").AlchemistNotFound | import("../../../Auth/AuthProvider.ts").AuthError | import("effect/PlatformError").PlatformError | import("../../../Auth/Profile.ts").ProfileError | CliKit.InteractionError, import("../../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CliKit.CliKit | import("../../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
//# sourceMappingURL=flows.d.ts.map