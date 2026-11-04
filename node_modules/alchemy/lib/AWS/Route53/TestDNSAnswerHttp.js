import * as route53 from "@distilled.cloud/aws/route-53";
import * as Layer from "effect/Layer";
import { makeRoute53ZoneHttpBinding } from "./BindingHttp.js";
import { TestDNSAnswer } from "./TestDNSAnswer.js";
export const TestDNSAnswerHttp = Layer.effect(TestDNSAnswer, makeRoute53ZoneHttpBinding({
    tag: "AWS.Route53.TestDNSAnswer",
    operation: route53.testDNSAnswer,
    actions: ["route53:TestDNSAnswer"],
    // route53:TestDNSAnswer does not support resource-level permissions.
    wildcardIam: true,
}));
//# sourceMappingURL=TestDNSAnswerHttp.js.map