import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as HttpClient from "effect/unstable/http/HttpClient";
/**
 * A running MicroVM's connection details, as returned by the {@link RunMicrovm}
 * and {@link CreateAuthToken} bindings.
 */
export interface MicrovmConnection {
    /**
     * The MicroVM endpoint hostname (no scheme), e.g.
     * `<id>.lambda-microvm.<region>.on.aws` — from `RunMicrovm`'s response.
     */
    endpoint: string;
    /**
     * The auth token from `CreateAuthToken` — a map of header name → value that
     * authorizes requests to the MicroVM endpoint (the AWS proxy validates them).
     * Values may be {@link Redacted.Redacted}.
     */
    authToken: Record<string, string | Redacted.Redacted<string> | undefined>;
}
/**
 * Flatten a MicroVM `authToken` (from {@link CreateAuthToken}) into a plain
 * header map, unwrapping any {@link Redacted.Redacted} values. Send these as
 * request headers when calling the MicroVM endpoint.
 */
export declare const microvmAuthHeaders: (authToken: MicrovmConnection["authToken"]) => Record<string, string>;
/**
 * Connect to a running MicroVM's in-VM RPC server and return a typed client
 * stub. The stub mirrors the image's tagged RPC `Shape`: value methods
 * `yield*` as `Effect`s, streaming methods pipe as `Stream`s. Each call is a
 * `POST https://<endpoint>/__rpc__/<method>` with the auth-token entries set as
 * request headers — the mirror of {@link serveRpc} running inside the MicroVM.
 *
 * @example
 * ```typescript
 * const vm = yield* runMicrovm({});
 * const { authToken } = yield* createAuthToken({
 *   microvmIdentifier: vm.microvmId,
 *   expirationInMinutes: 5,
 *   allowedPorts: [{ port: 8080 }],
 * });
 * const sandbox = yield* AWS.Lambda.connectMicrovm(Sandbox, {
 *   endpoint: vm.endpoint,
 *   authToken,
 * });
 * const reply = yield* sandbox.hello("world");
 * ```
 */
export declare const connectMicrovm: <S>(_image: abstract new (_: never) => S, connection: MicrovmConnection) => Effect.Effect<S, never, HttpClient.HttpClient>;
//# sourceMappingURL=MicrovmRpc.d.ts.map