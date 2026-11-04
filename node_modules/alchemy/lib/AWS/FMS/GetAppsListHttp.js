import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { GetAppsList } from "./GetAppsList.js";
export const GetAppsListHttp = Layer.effect(GetAppsList, makeFmsHttpBinding({
    capability: "GetAppsList",
    iamActions: ["fms:GetAppsList"],
    operation: fms.getAppsList,
}));
//# sourceMappingURL=GetAppsListHttp.js.map