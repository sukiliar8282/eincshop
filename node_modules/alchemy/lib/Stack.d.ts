import type { ConfigError } from "effect/Config";
import * as Context from "effect/Context";
import type { Crypto } from "effect/Crypto";
import * as Effect from "effect/Effect";
import { FileSystem } from "effect/FileSystem";
import * as Layer from "effect/Layer";
import { Path } from "effect/Path";
import * as Scope from "effect/Scope";
import type { HttpClient } from "effect/unstable/http/HttpClient";
import type { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner";
import type { ActionLike } from "./Action.ts";
import { AlchemyContext } from "./AlchemyContext.ts";
import { type ArtifactStore } from "./Artifacts.ts";
import { AuthProviders } from "./Auth/AuthProvider.ts";
import { CredentialsStore } from "./Auth/Credentials.ts";
import { ProfileStore } from "./Auth/Profile.ts";
import type { Interaction } from "./Interaction.ts";
import type { Input, InputProps } from "./Input.ts";
import * as Output from "./Output.ts";
import type { Provider, ProviderCollectionLike } from "./Provider.ts";
import type { ResourceBinding, ResourceLike } from "./Resource.ts";
import { Stage } from "./Stage.ts";
import type { State } from "./State/State.ts";
import { PlatformServices } from "./Util/PlatformServices.ts";
export type StackServices = Stack | Stage | Scope.Scope | FileSystem | Crypto | Path | AlchemyContext | HttpClient | ChildProcessSpawner | AuthProviders | ProfileStore | ArtifactStore | CredentialsStore | Interaction;
export type ProviderServices = ProviderCollectionLike | Provider<any> | EnvironmentLike | CredentialsLike | DockerLike;
export interface EnvironmentLike {
    readonly kind: "Environment";
}
export interface CredentialsLike {
    readonly kind: "Credentials";
}
export interface DockerLike {
    readonly key: "@alchemy/Docker";
}
export type StackEffect<A, Err = never, Req = never> = Effect.Effect<A, Err, PlatformServices | HttpClient | Scope.Scope | AuthProviders | AlchemyContext | Interaction | ProfileStore | CredentialsStore | ArtifactStore | State | Req>;
export type Stack = Context.ServiceClass.Shape<"Stack", Omit<StackSpec, "output">>;
export interface StackProps<Req> {
    providers: Layer.Layer<Extract<Req, ProviderServices>, never, StackServices>;
    state: Layer.Layer<State, never, StackServices>;
}
export declare const Stack: Context.ServiceClass<Stack, "Stack", Omit<StackSpec, "output">> & {
    make<A, Req>(stack: {
        Shape: A;
    }, effect: Effect.Effect<NoInfer<A extends object ? InputProps<A> : Input<A>>, ConfigError, Req>): Effect.Effect<CompiledStack<A>, ConfigError>;
    <Self>(): {
        <A, Req>(stackName: string, options: StackProps<NoInfer<Req>>, eff: Effect.Effect<A, ConfigError, Req>): Effect.Effect<Self, ConfigError> & {
            new (_: never): A extends object ? A : {};
            stage: {
                [stage: string]: Effect.Effect<Self>;
            };
        };
    };
    <Self, Shape>(): {
        (stackName: string): Effect.Effect<Self> & {
            new (_: never): Output.ToOutput<Shape>;
            make: <A, Req>(options: StackProps<NoInfer<Req>>, effect: Effect.Effect<A, ConfigError, Req>) => Effect.Effect<CompiledStack<A>, ConfigError>;
            stage: {
                [stage: string]: Effect.Effect<Self>;
            };
        };
    };
    <A, Req extends StackServices | ProviderServices = never>(stackName: string, options: StackProps<NoInfer<Req>>, eff: Effect.Effect<A, ConfigError, Req>): Effect.Effect<CompiledStack<A>, ConfigError>;
};
export interface StackSpec<Output = any> {
    name: string;
    stage: string;
    resources: {
        [logicalId: string]: ResourceLike;
    };
    bindings: {
        [logicalId: string]: ResourceBinding[];
    };
    /** Tasks registered on the stack, keyed by FQN. */
    actions: {
        [logicalId: string]: ActionLike;
    };
    output: Output;
}
export interface CompiledStack<Output = any, Services = any> extends StackSpec<Output> {
    services: Context.Context<Services>;
}
export declare const StackName: Effect.Effect<string, never, Stack>;
export interface MakeStackProps<ROut = never> {
    name: string;
    providers: Layer.Layer<ROut, never, StackServices>;
    state: Layer.Layer<State, never, StackServices>;
    /** @internal */
    stack?: StackSpec;
}
export declare const make: <ROut = never>(options: MakeStackProps<ROut>) => <A, Err = never, Req extends ROut | StackServices = never>(effect: Effect.Effect<A, Err, Req>) => Effect.Effect<CompiledStack<A, ROut | StackServices>, Err, AlchemyContext | ArtifactStore | AuthProviders | ChildProcessSpawner | CredentialsStore | Crypto | FileSystem | HttpClient | Interaction | Path | ProfileStore | Scope.Scope | Stage | Exclude<ROut, ROut | Stack | State> | Exclude<Req, ROut | Stack | State> | Exclude<AlchemyContext, ROut | Stack | State> | Exclude<ArtifactStore, ROut | Stack | State> | Exclude<AuthProviders, ROut | Stack | State> | Exclude<ChildProcessSpawner, ROut | Stack | State> | Exclude<CredentialsStore, ROut | Stack | State> | Exclude<Crypto, ROut | Stack | State> | Exclude<FileSystem, ROut | Stack | State> | Exclude<HttpClient, ROut | Stack | State> | Exclude<Interaction, ROut | Stack | State> | Exclude<Path, ROut | Stack | State> | Exclude<ProfileStore, ROut | Stack | State> | Exclude<Scope.Scope, ROut | Stack | State> | Exclude<Stack, ROut | Stack | State> | Exclude<Stage, ROut | Stack | State>>;
export declare const CurrentStack: Effect.Effect<Omit<StackSpec<any>, "output"> | undefined, never, never>;
export declare const evalStack: <A, B, StackErr, Err, Req>(effect: StackEffect<CompiledStack<A>, StackErr, Stage | AlchemyContext>, fn: (stack: CompiledStack<A>) => Effect.Effect<B, Err, Req>, options: {
    stage: string;
    dev?: boolean;
    /**
     * Optional caller-supplied scope. When provided, scoped resources
     * (e.g. the dev sidecar process) live until the caller closes this
     * scope instead of being torn down when `evalStack` resolves. Used
     * by the test harness so the sidecar survives across `beforeAll`,
     * tests, and `afterAll`. When omitted, behaves as before with a
     * private scope closed on completion.
     */
    scope?: Scope.Scope;
}) => Effect.Effect<B, Err | StackErr | import("effect/PlatformError").PlatformError, AlchemyContext | ArtifactStore | FileSystem | Interaction | Path | State>;
//# sourceMappingURL=Stack.d.ts.map