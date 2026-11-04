import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { DescribeStandards } from "./DescribeStandards.js";
export const DescribeStandardsHttp = Layer.effect(DescribeStandards, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.DescribeStandards",
    operation: securityhub.describeStandards,
    actions: ["securityhub:DescribeStandards"],
}));
//# sourceMappingURL=DescribeStandardsHttp.js.map