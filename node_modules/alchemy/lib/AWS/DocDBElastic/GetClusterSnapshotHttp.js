import * as docdbelastic from "@distilled.cloud/aws/docdb-elastic";
import * as Layer from "effect/Layer";
import { makeDocDBElasticAccountHttpBinding } from "./BindingHttp.js";
import { GetClusterSnapshot } from "./GetClusterSnapshot.js";
export const GetClusterSnapshotHttp = Layer.effect(GetClusterSnapshot, makeDocDBElasticAccountHttpBinding({
    tag: "AWS.DocDBElastic.GetClusterSnapshot",
    operation: docdbelastic.getClusterSnapshot,
    actions: ["docdb-elastic:GetClusterSnapshot"],
}));
//# sourceMappingURL=GetClusterSnapshotHttp.js.map