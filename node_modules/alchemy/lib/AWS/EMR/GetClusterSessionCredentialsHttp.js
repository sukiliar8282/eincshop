import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { GetClusterSessionCredentials } from "./GetClusterSessionCredentials.js";
export const GetClusterSessionCredentialsHttp = Layer.effect(GetClusterSessionCredentials, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.GetClusterSessionCredentials",
    operation: emr.getClusterSessionCredentials,
    actions: ["elasticmapreduce:GetClusterSessionCredentials"],
}));
//# sourceMappingURL=GetClusterSessionCredentialsHttp.js.map