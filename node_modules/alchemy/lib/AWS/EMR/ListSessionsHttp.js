import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { ListSessions } from "./ListSessions.js";
export const ListSessionsHttp = Layer.effect(ListSessions, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.ListSessions",
    operation: emr.listSessions,
    actions: ["elasticmapreduce:ListSessions"],
}));
//# sourceMappingURL=ListSessionsHttp.js.map