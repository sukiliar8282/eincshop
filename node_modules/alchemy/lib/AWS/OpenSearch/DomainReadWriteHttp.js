import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeOpenSearchDataPlaneBinding, makeReadDomainClient, makeWriteDomainClient, } from "./DataPlaneHttp.js";
import { DomainReadWrite } from "./DomainReadWrite.js";
export const DomainReadWriteHttp = Layer.effect(DomainReadWrite, makeOpenSearchDataPlaneBinding({
    name: "DomainReadWrite",
    iamActions: ["es:ESHttp*"],
    makeClient: (send) => ({
        ...makeReadDomainClient(send),
        ...makeWriteDomainClient(send),
        request: (method, path, options) => send({
            method,
            path,
            query: options?.query,
            json: options?.body,
        }).pipe(Effect.map(({ body }) => body)),
    }),
}));
//# sourceMappingURL=DomainReadWriteHttp.js.map