import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeAddressListJobHttpBinding } from "./BindingHttp.js";
import { GetAddressListImportJob } from "./GetAddressListImportJob.js";
export const GetAddressListImportJobHttp = Layer.effect(GetAddressListImportJob, makeAddressListJobHttpBinding({
    tag: "AWS.MailManager.GetAddressListImportJob",
    operation: mm.getAddressListImportJob,
    actions: ["ses:GetAddressListImportJob"],
}));
//# sourceMappingURL=GetAddressListImportJobHttp.js.map