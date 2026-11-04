import * as featurestore from "@distilled.cloud/aws/sagemaker-featurestore-runtime";
import * as Layer from "effect/Layer";
import { makeFeatureGroupHttpBinding } from "./BindingHttp.js";
import { ListRecords } from "./ListRecords.js";
export const ListRecordsHttp = Layer.effect(ListRecords, makeFeatureGroupHttpBinding({
    tag: "AWS.SageMaker.ListRecords",
    operation: featurestore.listRecords,
    actions: ["sagemaker:ListRecords"],
    prepare: (request, featureGroupName) => ({
        ...request,
        FeatureGroupName: featureGroupName,
    }),
}));
//# sourceMappingURL=ListRecordsHttp.js.map