import * as Lambda from "@distilled.cloud/aws/lambda";
import * as Layer from "effect/Layer";
import { makeLambdaAccountHttpBinding } from "./BindingHttp.js";
import { ListFunctions } from "./ListFunctions.js";
export const ListFunctionsHttp = Layer.effect(ListFunctions, makeLambdaAccountHttpBinding({
    tag: "AWS.Lambda.ListFunctions",
    operation: Lambda.listFunctions,
    actions: ["lambda:ListFunctions"],
}));
//# sourceMappingURL=ListFunctionsHttp.js.map