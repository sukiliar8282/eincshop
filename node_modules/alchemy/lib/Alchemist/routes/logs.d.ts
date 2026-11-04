import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { type StackTarget } from "../Session.ts";
export interface ResourceIdentity {
    readonly fqn: string;
    readonly logicalId: string;
    readonly resourceType: string;
}
export interface LogResource extends ResourceIdentity {
    readonly supportsQuery: boolean;
    readonly supportsTail: boolean;
}
export interface LogEntry {
    readonly resource: ResourceIdentity;
    readonly timestamp: Date;
    readonly message: string;
}
export interface LogInput {
    readonly target: StackTarget;
    /** Logical IDs to include. Empty or omitted means every resource. */
    readonly resources?: ReadonlyArray<string>;
}
export interface QueryInput extends LogInput {
    readonly limit?: number;
    readonly since?: Date;
}
/** Every deployed resource, with the log capabilities its provider offers. */
export declare const resources: (target: StackTarget) => Effect.Effect<LogResource[], unknown, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
/** Query past log entries across the selected resources, oldest first. */
export declare const entries: (input: QueryInput) => Effect.Effect<{
    resource: {
        fqn: string;
        logicalId: string;
        resourceType: string;
    };
    timestamp: Date;
    message: string;
}[], any, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
/** Live-stream log entries from every selected resource that supports it. */
export declare const tail: (input: LogInput) => Stream.Stream<LogEntry, any, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../Auth/Profile.ts").ProfileStore>;
//# sourceMappingURL=logs.d.ts.map