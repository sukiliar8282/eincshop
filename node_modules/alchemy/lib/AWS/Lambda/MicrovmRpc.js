import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import { makeFetchRpcStub } from "../../Rpc.js";
/**
 * Flatten a MicroVM `authToken` (from {@link CreateAuthToken}) into a plain
 * header map, unwrapping any {@link Redacted.Redacted} values. Send these as
 * request headers when calling the MicroVM endpoint.
 */
export const microvmAuthHeaders = (authToken) => {
    const headers = {};
    for (const [key, value] of Object.entries(authToken)) {
        if (value === undefined)
            continue;
        headers[key] = Redacted.isRedacted(value) ? Redacted.value(value) : value;
    }
    return headers;
};
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
export const connectMicrovm = (_image, connection) => Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;
    const headers = microvmAuthHeaders(connection.authToken);
    return makeFetchRpcStub({
        baseUrl: `https://${connection.endpoint}`,
        fetch: (request) => client.execute(request.pipe(HttpClientRequest.setHeaders(headers))),
    });
});
//# sourceMappingURL=MicrovmRpc.js.map