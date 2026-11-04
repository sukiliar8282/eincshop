import * as shield from "@distilled.cloud/aws/shield";
import * as Layer from "effect/Layer";
import { makeShieldHttpBinding } from "./BindingHttp.js";
import { ListAttacks } from "./ListAttacks.js";
export const ListAttacksHttp = Layer.effect(ListAttacks, makeShieldHttpBinding({
    tag: "AWS.Shield.ListAttacks",
    operation: shield.listAttacks,
    actions: ["shield:ListAttacks"],
}));
//# sourceMappingURL=ListAttacksHttp.js.map