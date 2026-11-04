import * as datasync from "@distilled.cloud/aws/datasync";
import * as Layer from "effect/Layer";
import { makeDataSyncTaskHttpBinding } from "./BindingHttp.js";
import { ListTaskExecutions } from "./ListTaskExecutions.js";
export const ListTaskExecutionsHttp = Layer.effect(ListTaskExecutions, makeDataSyncTaskHttpBinding({
    tag: "AWS.DataSync.ListTaskExecutions",
    operation: datasync.listTaskExecutions,
    actions: ["datasync:ListTaskExecutions"],
}));
//# sourceMappingURL=ListTaskExecutionsHttp.js.map