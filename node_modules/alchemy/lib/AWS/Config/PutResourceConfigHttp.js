import * as config from "@distilled.cloud/aws/config-service";
import * as Layer from "effect/Layer";
import { makeConfigAccountHttpBinding } from "./BindingHttp.js";
import { PutResourceConfig } from "./PutResourceConfig.js";
export const PutResourceConfigHttp = Layer.effect(PutResourceConfig, makeConfigAccountHttpBinding({
    tag: "AWS.Config.PutResourceConfig",
    operation: config.putResourceConfig,
    actions: ["config:PutResourceConfig"],
}));
//# sourceMappingURL=PutResourceConfigHttp.js.map