import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { TerminateSession } from "./TerminateSession.js";
export const TerminateSessionHttp = Layer.effect(TerminateSession, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.TerminateSession",
    operation: emr.terminateSession,
    actions: ["elasticmapreduce:TerminateSession"],
}));
//# sourceMappingURL=TerminateSessionHttp.js.map