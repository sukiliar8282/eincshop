import * as securitylake from "@distilled.cloud/aws/securitylake";
import * as Layer from "effect/Layer";
import { makeSecurityLakeDataLakeHttpBinding } from "./BindingHttp.js";
import { GetDataLakeSources } from "./GetDataLakeSources.js";
export const GetDataLakeSourcesHttp = Layer.effect(GetDataLakeSources, makeSecurityLakeDataLakeHttpBinding({
    tag: "AWS.SecurityLake.GetDataLakeSources",
    operation: securitylake.getDataLakeSources,
    actions: ["securitylake:GetDataLakeSources"],
}));
//# sourceMappingURL=GetDataLakeSourcesHttp.js.map