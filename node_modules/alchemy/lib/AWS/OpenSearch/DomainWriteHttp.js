import * as Layer from "effect/Layer";
import { makeOpenSearchDataPlaneBinding, makeWriteDomainClient, } from "./DataPlaneHttp.js";
import { DomainWrite } from "./DomainWrite.js";
export const DomainWriteHttp = Layer.effect(DomainWrite, makeOpenSearchDataPlaneBinding({
    name: "DomainWrite",
    iamActions: [
        "es:ESHttpPut",
        "es:ESHttpPost",
        "es:ESHttpDelete",
        "es:ESHttpPatch",
    ],
    makeClient: makeWriteDomainClient,
}));
//# sourceMappingURL=DomainWriteHttp.js.map