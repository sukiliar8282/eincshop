import * as Layer from "effect/Layer";
import { makeOpenSearchDataPlaneBinding, makeReadDomainClient, } from "./DataPlaneHttp.js";
import { DomainRead } from "./DomainRead.js";
export const DomainReadHttp = Layer.effect(DomainRead, makeOpenSearchDataPlaneBinding({
    name: "DomainRead",
    iamActions: ["es:ESHttpGet", "es:ESHttpHead"],
    makeClient: makeReadDomainClient,
}));
//# sourceMappingURL=DomainReadHttp.js.map