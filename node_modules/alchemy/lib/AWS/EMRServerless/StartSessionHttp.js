import * as emr from "@distilled.cloud/aws/emr-serverless";
import * as Layer from "effect/Layer";
import { makeEmrServerlessHttpBinding } from "./BindingHttp.js";
import { StartSession } from "./StartSession.js";
export const StartSessionHttp = Layer.effect(StartSession, makeEmrServerlessHttpBinding({
    tag: "AWS.EMRServerless.StartSession",
    operation: emr.startSession,
    actions: ["emr-serverless:StartSession"],
    passRole: true,
}));
//# sourceMappingURL=StartSessionHttp.js.map