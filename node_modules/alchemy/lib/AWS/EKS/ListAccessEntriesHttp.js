import * as eks from "@distilled.cloud/aws/eks";
import * as Layer from "effect/Layer";
import { makeEKSClusterHttpBinding } from "./BindingHttp.js";
import { ListAccessEntries } from "./ListAccessEntries.js";
export const ListAccessEntriesHttp = Layer.effect(ListAccessEntries, makeEKSClusterHttpBinding({
    tag: "AWS.EKS.ListAccessEntries",
    operation: eks.listAccessEntries,
    actions: ["eks:ListAccessEntries"],
    key: "clusterName",
    scope: "cluster",
}));
//# sourceMappingURL=ListAccessEntriesHttp.js.map