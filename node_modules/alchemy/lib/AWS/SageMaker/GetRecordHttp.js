import * as featurestore from "@distilled.cloud/aws/sagemaker-featurestore-runtime";
import * as Layer from "effect/Layer";
import { makeFeatureGroupHttpBinding } from "./BindingHttp.js";
import { GetRecord } from "./GetRecord.js";
export const GetRecordHttp = Layer.effect(GetRecord, makeFeatureGroupHttpBinding({
    tag: "AWS.SageMaker.GetRecord",
    operation: featurestore.getRecord,
    actions: ["sagemaker:GetRecord"],
    prepare: (request, featureGroupName) => ({
        ...request,
        FeatureGroupName: featureGroupName,
    }),
}));
//# sourceMappingURL=GetRecordHttp.js.map