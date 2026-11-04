import * as b2bi from "@distilled.cloud/aws/b2bi";
import * as Layer from "effect/Layer";
import { makeTransformerScopedHttpBinding } from "./BindingHttp.js";
import { GetTransformerJob } from "./GetTransformerJob.js";
export const GetTransformerJobHttp = Layer.effect(GetTransformerJob, makeTransformerScopedHttpBinding({
    tag: "AWS.B2BI.GetTransformerJob",
    operation: b2bi.getTransformerJob,
    actions: ["b2bi:GetTransformerJob"],
}));
//# sourceMappingURL=GetTransformerJobHttp.js.map