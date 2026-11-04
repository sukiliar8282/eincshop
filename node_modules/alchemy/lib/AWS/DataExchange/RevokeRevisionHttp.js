import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeRevisionHttpBinding } from "./BindingHttp.js";
import { RevokeRevision } from "./RevokeRevision.js";
export const RevokeRevisionHttp = Layer.effect(RevokeRevision, makeRevisionHttpBinding({
    tag: "AWS.DataExchange.RevokeRevision",
    operation: dataexchange.revokeRevision,
    actions: ["dataexchange:RevokeRevision"],
}));
//# sourceMappingURL=RevokeRevisionHttp.js.map