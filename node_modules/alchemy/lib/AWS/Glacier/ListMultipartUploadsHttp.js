import * as glacier from "@distilled.cloud/aws/glacier";
import * as Layer from "effect/Layer";
import { makeGlacierVaultHttpBinding } from "./BindingHttp.js";
import { ListMultipartUploads } from "./ListMultipartUploads.js";
export const ListMultipartUploadsHttp = Layer.effect(ListMultipartUploads, makeGlacierVaultHttpBinding({
    tag: "AWS.Glacier.ListMultipartUploads",
    operation: glacier.listMultipartUploads,
    actions: ["glacier:ListMultipartUploads"],
}));
//# sourceMappingURL=ListMultipartUploadsHttp.js.map