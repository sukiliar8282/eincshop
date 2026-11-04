import * as mwaa from "@distilled.cloud/aws/mwaa-serverless";
import * as Layer from "effect/Layer";
import { makeMwaaServerlessHttpBinding } from "./BindingHttp.js";
import { ListTaskInstances } from "./ListTaskInstances.js";
export const ListTaskInstancesHttp = Layer.effect(ListTaskInstances, makeMwaaServerlessHttpBinding({
    tag: "AWS.MWAAServerless.ListTaskInstances",
    operation: mwaa.listTaskInstances,
    actions: ["airflow-serverless:ListTaskInstances"],
}));
//# sourceMappingURL=ListTaskInstancesHttp.js.map