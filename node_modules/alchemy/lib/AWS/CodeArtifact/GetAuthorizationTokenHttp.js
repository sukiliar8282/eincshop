import * as codeartifact from "@distilled.cloud/aws/codeartifact";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import { toWireSeconds } from "../../Util/Duration.js";
import { isBindingHost } from "../Lambda/Function.js";
import { GetAuthorizationToken, } from "./GetAuthorizationToken.js";
/**
 * HTTP implementation of {@link GetAuthorizationToken} over the CodeArtifact
 * API. Domain-scoped (not repository-scoped): tokens authorize against every
 * repository in the domain, and CodeArtifact exchanges the caller's
 * credentials via `sts:GetServiceBearerToken`.
 */
export const GetAuthorizationTokenHttp = Layer.effect(GetAuthorizationToken, Effect.gen(function* () {
    const op = yield* codeartifact.getAuthorizationToken;
    return Effect.fn(function* (domain) {
        const DomainName = yield* domain.domainName;
        const Owner = yield* domain.owner;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.CodeArtifact.GetAuthorizationToken(${domain}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["codeartifact:GetAuthorizationToken"],
                            Resource: [domain.domainArn],
                        },
                        {
                            // CodeArtifact exchanges the caller's credentials for the
                            // bearer token through STS on the caller's behalf.
                            Effect: "Allow",
                            Action: ["sts:GetServiceBearerToken"],
                            Resource: ["*"],
                            Condition: {
                                StringEquals: {
                                    "sts:AWSServiceName": "codeartifact.amazonaws.com",
                                },
                            },
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.CodeArtifact.GetAuthorizationToken(${domain.LogicalId})`)(function* (request) {
            const owner = yield* Owner;
            return yield* op({
                domain: yield* DomainName,
                ...(owner === "" ? {} : { domainOwner: owner }),
                durationSeconds: toWireSeconds(request?.duration),
            });
        });
    });
}));
//# sourceMappingURL=GetAuthorizationTokenHttp.js.map