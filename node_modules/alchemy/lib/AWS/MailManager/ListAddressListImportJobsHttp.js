import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeAddressListHttpBinding } from "./BindingHttp.js";
import { ListAddressListImportJobs } from "./ListAddressListImportJobs.js";
export const ListAddressListImportJobsHttp = Layer.effect(ListAddressListImportJobs, makeAddressListHttpBinding({
    tag: "AWS.MailManager.ListAddressListImportJobs",
    operation: mm.listAddressListImportJobs,
    actions: ["ses:ListAddressListImportJobs"],
}));
//# sourceMappingURL=ListAddressListImportJobsHttp.js.map