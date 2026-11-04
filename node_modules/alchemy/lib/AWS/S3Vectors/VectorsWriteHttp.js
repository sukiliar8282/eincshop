import * as Layer from "effect/Layer";
import { makeVectorsHttpBinding, makeWriteVectorsClient, writeVectorsActions, } from "./BindingHttp.js";
import { VectorsWrite } from "./VectorsWrite.js";
/**
 * HTTP implementation of {@link VectorsWrite} — calls the S3 Vectors data
 * plane with the host Function's own credentials, granting only the write
 * actions (`PutVectors`, `DeleteVectors`) on the bound index.
 */
export const VectorsWriteHttp = Layer.effect(VectorsWrite, makeVectorsHttpBinding({
    name: "VectorsWrite",
    actions: writeVectorsActions,
    makeClient: makeWriteVectorsClient,
}));
//# sourceMappingURL=VectorsWriteHttp.js.map