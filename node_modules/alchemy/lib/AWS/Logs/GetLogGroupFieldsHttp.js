import * as Logs from "@distilled.cloud/aws/cloudwatch-logs";
import * as Layer from "effect/Layer";
import { makeLogGroupHttpBinding } from "./BindingHttp.js";
import { GetLogGroupFields } from "./GetLogGroupFields.js";
export const GetLogGroupFieldsHttp = Layer.effect(GetLogGroupFields, makeLogGroupHttpBinding({
    tag: "AWS.Logs.GetLogGroupFields",
    operation: Logs.getLogGroupFields,
    actions: ["logs:GetLogGroupFields"],
}));
//# sourceMappingURL=GetLogGroupFieldsHttp.js.map