import * as ecrpublic from "@distilled.cloud/aws/ecr-public";
import * as Layer from "effect/Layer";
import { makePublicRegistryHttpBinding } from "./BindingHttp.js";
import { GetAuthorizationToken } from "./GetAuthorizationToken.js";
export const GetAuthorizationTokenHttp = Layer.effect(GetAuthorizationToken, makePublicRegistryHttpBinding({
    capability: "GetAuthorizationToken",
    // The API requires both permissions; see the GetAuthorizationToken docs.
    iamActions: [
        "ecr-public:GetAuthorizationToken",
        "sts:GetServiceBearerToken",
    ],
    operation: ecrpublic.getAuthorizationToken,
}));
//# sourceMappingURL=GetAuthorizationTokenHttp.js.map