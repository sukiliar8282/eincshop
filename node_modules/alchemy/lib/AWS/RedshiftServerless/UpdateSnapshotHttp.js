import * as serverless from "@distilled.cloud/aws/redshift-serverless";
import * as Layer from "effect/Layer";
import { makeServerlessAccountHttpBinding } from "./BindingHttp.js";
import { UpdateSnapshot } from "./UpdateSnapshot.js";
export const UpdateSnapshotHttp = Layer.effect(UpdateSnapshot, makeServerlessAccountHttpBinding({
    tag: "AWS.RedshiftServerless.UpdateSnapshot",
    operation: serverless.updateSnapshot,
    actions: ["redshift-serverless:UpdateSnapshot"],
}));
//# sourceMappingURL=UpdateSnapshotHttp.js.map