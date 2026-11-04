import * as Effect from "effect/Effect";
import { Self } from "../../Self.js";
import { AccountApiToken } from "../ApiToken/AccountApiToken.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { authorizeWith } from "../HttpClientUtils.js";
import { NamespaceError } from "./NamespaceTypes.js";
/**
 * Shared scaffolding for the HTTP-backed KV services.
 *
 * Creates a scoped {@link AccountApiToken}, binds its `value` / `accountId`
 * into the host Worker at deploy time, then delegates to `makeClient` with
 * the bound token and the namespace's `namespaceId`.
 */
export const makeHttpKVNamespaceBinding = (options) => Effect.gen(function* () {
    const Token = yield* AccountApiToken;
    const self = yield* Self;
    const env = yield* CloudflareEnvironment;
    return Effect.fn(function* (namespace) {
        const { accountId } = yield* env;
        const token = yield* Token(`${self.LogicalId}Token`);
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* token.bind `${namespace.LogicalId}`({
                policies: [
                    {
                        effect: "allow",
                        permissionGroups: options.permissionGroups,
                        resources: {
                            [`com.cloudflare.api.account.${accountId}`]: "*",
                        },
                    },
                ],
            });
        }
        const bound = {
            value: yield* token.value,
            accountId: yield* token.accountId,
        };
        const namespaceId = yield* namespace.namespaceId;
        return options.makeClient(bound, namespaceId);
    });
});
/** Build a scoped-token {@link KVAuth} from a bound {@link HttpToken}. */
export const makeKVAuth = (token) => ({
    authorize: authorizeWith(token),
    accountId: token.accountId,
});
const KV_HTTP_PERMISSION_GROUPS = [
    "Workers KV Storage Read",
    "Workers KV Storage Write",
];
/** Resolve the account and namespace id once per operation. */
export const makeKVHttpScope = (auth, namespaceId) => Effect.gen(function* () {
    const accountId = yield* auth.accountId;
    const id = yield* namespaceId;
    return { accountId, namespaceId: id };
});
export const toKVNamespaceError = (error) => new NamespaceError({
    message: typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : "Unknown KV error",
    cause: error instanceof Error ? error : new Error(String(error)),
});
//# sourceMappingURL=NamespaceHttp.js.map