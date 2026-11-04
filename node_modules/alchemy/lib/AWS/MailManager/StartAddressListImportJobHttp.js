import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeAddressListJobHttpBinding } from "./BindingHttp.js";
import { StartAddressListImportJob } from "./StartAddressListImportJob.js";
export const StartAddressListImportJobHttp = Layer.effect(StartAddressListImportJob, makeAddressListJobHttpBinding({
    tag: "AWS.MailManager.StartAddressListImportJob",
    operation: mm.startAddressListImportJob,
    actions: ["ses:StartAddressListImportJob"],
}));
//# sourceMappingURL=StartAddressListImportJobHttp.js.map