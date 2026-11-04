import * as serverless from "@distilled.cloud/aws/redshift-serverless";
import * as Layer from "effect/Layer";
import { makeServerlessNamespaceHttpBinding, serverlessArnPrefix, } from "./BindingHttp.js";
import { RestoreFromSnapshot } from "./RestoreFromSnapshot.js";
export const RestoreFromSnapshotHttp = Layer.effect(RestoreFromSnapshot, makeServerlessNamespaceHttpBinding({
    tag: "AWS.RedshiftServerless.RestoreFromSnapshot",
    operation: serverless.restoreFromSnapshot,
    actions: ["redshift-serverless:RestoreFromSnapshot"],
    // The operation authorizes against sibling resource ARNs (snapshots,
    // recovery points, the serving workgroup) in addition to the namespace.
    extraResources: (arn) => {
        const prefix = serverlessArnPrefix(arn);
        return [`${prefix}:snapshot/*`, `${prefix}:workgroup/*`];
    },
}));
//# sourceMappingURL=RestoreFromSnapshotHttp.js.map