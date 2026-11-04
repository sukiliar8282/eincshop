import * as cip from "@distilled.cloud/aws/cognito-identity-provider";
import * as Effect from "effect/Effect";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * An OAuth 2.0 resource server for an Amazon Cognito user pool. Resource
 * servers declare custom scopes that app clients can request in
 * `client_credentials` and authorization-code flows.
 * ### Creating a Resource Server
 * **Example:** API with Custom Scopes
 * ```typescript
 * import * as Cognito from "alchemy/AWS/Cognito";
 *
 * const pool = yield* Cognito.UserPool("Users", {});
 * const api = yield* Cognito.ResourceServer("Api", {
 *   userPoolId: pool.userPoolId,
 *   identifier: "https://api.example.com",
 *   scopes: [
 *     { scopeName: "read", scopeDescription: "Read access" },
 *     { scopeName: "write", scopeDescription: "Write access" },
 *   ],
 * });
 * ```
 *
 * **Example:** Client Requesting Resource-Server Scopes
 * ```typescript
 * const client = yield* Cognito.UserPoolClient("Machine", {
 *   userPoolId: pool.userPoolId,
 *   generateSecret: true,
 *   allowedOAuthFlowsUserPoolClient: true,
 *   allowedOAuthFlows: ["client_credentials"],
 *   allowedOAuthScopes: ["https://api.example.com/read"],
 * });
 * ```
 *
 * @resource
 */
export const ResourceServer = Resource("AWS.Cognito.ResourceServer");
const toWireScopes = (scopes) => scopes?.map((scope) => ({
    ScopeName: scope.scopeName,
    ScopeDescription: scope.scopeDescription,
}));
const canonicalScopes = (scopes) => (scopes ?? [])
    .map((scope) => `${scope.ScopeName}:${scope.ScopeDescription}`)
    .sort()
    .join(",");
export const ResourceServerProvider = () => Provider.effect(ResourceServer, Effect.gen(function* () {
    const createIdentifier = Effect.fn(function* (id, props) {
        return (props.identifier ??
            (yield* createPhysicalName({ id, maxLength: 256 })));
    });
    const describeServer = Effect.fn(function* (userPoolId, identifier) {
        return yield* cip
            .describeResourceServer({
            UserPoolId: userPoolId,
            Identifier: identifier,
        })
            .pipe(Effect.map((r) => r.ResourceServer), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return ResourceServer.Provider.of({
        stables: ["identifier", "userPoolId"],
        // Sub-resource keyed entirely by its user pool (userPoolId) with no global
        // enumeration API of its own — nuke reaches it through the parent's
        // deletion, so enumeration returns empty per the ProviderService
        // doctrine.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const userPoolId = output?.userPoolId ?? olds?.userPoolId;
            if (userPoolId === undefined)
                return undefined;
            const identifier = output?.identifier ?? (yield* createIdentifier(id, olds ?? {}));
            const observed = yield* describeServer(userPoolId, identifier);
            return observed === undefined
                ? undefined
                : {
                    identifier,
                    userPoolId,
                    name: observed.Name ?? identifier,
                };
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldIdentifier = yield* createIdentifier(id, olds ?? {});
            const newIdentifier = yield* createIdentifier(id, news ?? {});
            if (oldIdentifier !== newIdentifier ||
                olds?.userPoolId !== news?.userPoolId) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const identifier = output?.identifier ?? (yield* createIdentifier(id, news));
            const userPoolId = news.userPoolId;
            const name = news.name ?? identifier;
            // 1. OBSERVE
            let observed = yield* describeServer(userPoolId, identifier);
            // 2. ENSURE
            if (observed === undefined) {
                observed = yield* cip
                    .createResourceServer({
                    UserPoolId: userPoolId,
                    Identifier: identifier,
                    Name: name,
                    Scopes: toWireScopes(news.scopes),
                })
                    .pipe(Effect.map((r) => r.ResourceServer));
            }
            else {
                // 3. SYNC — name and scopes are mutable in place.
                const drift = observed.Name !== name ||
                    canonicalScopes(observed.Scopes) !==
                        canonicalScopes(toWireScopes(news.scopes));
                if (drift) {
                    observed = yield* cip
                        .updateResourceServer({
                        UserPoolId: userPoolId,
                        Identifier: identifier,
                        Name: name,
                        Scopes: toWireScopes(news.scopes),
                    })
                        .pipe(Effect.map((r) => r.ResourceServer));
                }
            }
            yield* session.note(identifier);
            return { identifier, userPoolId, name };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* cip
                .deleteResourceServer({
                UserPoolId: output.userPoolId,
                Identifier: output.identifier,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=ResourceServer.js.map