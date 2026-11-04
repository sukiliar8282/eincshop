import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsAccountHttpBinding } from "./BindingHttp.js";
import { ListOriginationNumbers } from "./ListOriginationNumbers.js";
export const ListOriginationNumbersHttp = Layer.effect(ListOriginationNumbers, makeSnsAccountHttpBinding({
    tag: "AWS.SNS.ListOriginationNumbers",
    operation: sns.listOriginationNumbers,
    actions: ["sns:ListOriginationNumbers", "sms-voice:DescribePhoneNumbers"],
}));
//# sourceMappingURL=ListOriginationNumbersHttp.js.map