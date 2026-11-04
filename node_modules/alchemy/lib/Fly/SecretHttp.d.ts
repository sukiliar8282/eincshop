import { Credentials } from "@distilled.cloud/fly-io";
import type * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as HttpClient from "effect/unstable/http/HttpClient";
import type { RuntimeContext } from "../RuntimeContext.ts";
import type { App } from "./App.ts";
import type { Secret } from "./Secret.ts";
import type { SecretKey } from "./SecretKey.ts";
/**
 * Shared scaffolding for the HTTP-backed Fly Secret bindings.
 *
 * Fly has no native Worker-style binding. This layer captures the ambient
 * org `FLY_API_TOKEN` during stack-eval (so Actions work in-process) and,
 * when the host is a {@link Machine} or {@link Service}, injects
 * `FLY_API_TOKEN`, `FLY_APP_NAME`, and `FLY_SECRET_${LogicalId}` into the
 * host env as Outputs. Runtime calls inside a deployed host read those
 * env vars via {@link CredentialsFromEnv}.
 *
 * NOT exported from `index.ts`.
 */
export type AppNamed = Secret | SecretKey;
export declare const makeHttpSecretBinding: <Target extends AppNamed, Client>(options: {
    makeClient: (auth: SecretAuth, appName: Effect.Effect<string>, secretName: Effect.Effect<string>) => Client;
    /**
     * PetSem encrypt/sign/decrypt/verify only work from a Machine over
     * `/.fly/api` (implicit machine identity). Org tokens return Forbidden.
     */
    kms?: boolean;
}) => Effect.Effect<(resource: Target) => Effect.Effect<Client, never, never>, never, Credentials | HttpClient.HttpClient>;
/**
 * Same scaffolding as {@link makeHttpSecretBinding}, but the target is
 * an {@link App} (no secret name). Used by ListSecrets.
 */
export declare const makeHttpAppBinding: <Client>(options: {
    makeClient: (auth: SecretAuth, appName: Effect.Effect<string>) => Client;
}) => Effect.Effect<(app: App) => Effect.Effect<Client, never, never>, never, Credentials | HttpClient.HttpClient>;
/**
 * Injectable auth for the Secret HTTP client builders. Supplies an
 * `authorize` that provides `Credentials` + `HttpClient` to a raw SDK op.
 */
export interface SecretAuth {
    authorize: <A, E>(eff: Effect.Effect<A, E, Credentials | HttpClient.HttpClient>) => Effect.Effect<A, E, RuntimeContext>;
}
/** Build auth that uses ambient stack creds, or env creds inside a host. */
export declare const makeSecretAuth: (ambient: Context.Context<Credentials | HttpClient.HttpClient>) => SecretAuth;
/**
 * PetSem encrypt/sign/decrypt/verify from a Machine. Org API tokens are
 * Forbidden; the machine identity is the unix socket at `/.fly/api`.
 * {@link MachineIdentity} is the protocol signal (no Authorization,
 * Connection: close). GetSecret in the same process keeps Bearer.
 */
export declare const makeKmsAuth: (ambient: Context.Context<Credentials | HttpClient.HttpClient>) => SecretAuth;
export declare const unwrapSecretValue: (value: Redacted.Redacted<string> | string) => string;
//# sourceMappingURL=SecretHttp.d.ts.map