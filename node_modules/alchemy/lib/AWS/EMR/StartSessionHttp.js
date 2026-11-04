import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { StartSession } from "./StartSession.js";
export const StartSessionHttp = Layer.effect(StartSession, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.StartSession",
    operation: emr.startSession,
    actions: ["elasticmapreduce:StartSession"],
}));
//# sourceMappingURL=StartSessionHttp.js.map