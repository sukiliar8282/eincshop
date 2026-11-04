import * as account from "@distilled.cloud/aws/account";
import * as Layer from "effect/Layer";
import { makeAccountHttpBinding } from "./BindingHttp.js";
import { GetRegionOptStatus } from "./GetRegionOptStatus.js";
export const GetRegionOptStatusHttp = Layer.effect(GetRegionOptStatus, makeAccountHttpBinding({
    capability: "GetRegionOptStatus",
    iamActions: ["account:GetRegionOptStatus"],
    operation: account.getRegionOptStatus,
}));
//# sourceMappingURL=GetRegionOptStatusHttp.js.map