import * as featurestore from "@distilled.cloud/aws/sagemaker-featurestore-runtime";
import * as Layer from "effect/Layer";
import { makeFeatureGroupHttpBinding } from "./BindingHttp.js";
import { PutRecord } from "./PutRecord.js";
export const PutRecordHttp = Layer.effect(PutRecord, makeFeatureGroupHttpBinding({
    tag: "AWS.SageMaker.PutRecord",
    operation: featurestore.putRecord,
    actions: ["sagemaker:PutRecord"],
    prepare: (request, featureGroupName) => ({
        ...request,
        FeatureGroupName: featureGroupName,
    }),
}));
//# sourceMappingURL=PutRecordHttp.js.map