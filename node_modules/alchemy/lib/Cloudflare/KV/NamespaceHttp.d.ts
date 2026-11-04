import * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import { Self } from "../../Self.ts";
import type { PermissionGroupRef } from "../ApiToken/Common.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Credentials } from "../Credentials.ts";
import type { Namespace } from "./Namespace.ts";
import { NamespaceError } from "./NamespaceTypes.ts";
/**
 * Shared scaffolding for the HTTP-backed KV services.
 *
 * Creates a scoped {@link AccountApiToken}, binds its `value` / `accountId`
 * into the host Worker at deploy time, then delegates to `makeClient` with
 * the bound token and the namespace's `namespaceId`.
 */
export declare const makeHttpKVNamespaceBinding: <Client>(options: {
    permissionGroups: PermissionGroup[];
    makeClient: (token: HttpToken, namespaceId: Effect.Effect<string>) => Client;
}) => Effect.Effect<(namespace: Namespace) => Effect.Effect<Client, never, never>, never, CloudflareEnvironment | Self<{
    Type: string;
    LogicalId: string;
}>>;
export interface HttpToken {
    value: Effect.Effect<Redacted.Redacted<string>>;
    accountId: Effect.Effect<string>;
}
export interface HttpScope {
    accountId: string;
    namespaceId: string;
}
/**
 * Injectable auth for the KV HTTP client builders. Both the scoped-token
 * (`*Http`) and current-credentials (`*Local`) variants supply an `authorize`
 * (which provides `Credentials` + `HttpClient` to a raw SDK op) and an
 * `accountId`, so the client builders are agnostic to how creds are obtained.
 */
export interface KVAuth {
    authorize: <A, E>(eff: Effect.Effect<A, E, Credentials | HttpClient.HttpClient>) => Effect.Effect<A, E, RuntimeContext>;
    accountId: Effect.Effect<string>;
}
/** Build a scoped-token {@link KVAuth} from a bound {@link HttpToken}. */
export declare const makeKVAuth: (token: HttpToken) => KVAuth;
declare const KV_HTTP_PERMISSION_GROUPS: PermissionGroupRef[];
type PermissionGroup = (typeof KV_HTTP_PERMISSION_GROUPS)[number];
/** Resolve the account and namespace id once per operation. */
export declare const makeKVHttpScope: (auth: KVAuth, namespaceId: Effect.Effect<string>) => Effect.Effect<HttpScope>;
export declare const toKVNamespaceError: (error: unknown) => NamespaceError;
export {};
//# sourceMappingURL=NamespaceHttp.d.ts.map