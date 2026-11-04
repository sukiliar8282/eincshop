import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { DescribeStandardsControls } from "./DescribeStandardsControls.js";
export const DescribeStandardsControlsHttp = Layer.effect(DescribeStandardsControls, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.DescribeStandardsControls",
    operation: securityhub.describeStandardsControls,
    actions: ["securityhub:DescribeStandardsControls"],
}));
//# sourceMappingURL=DescribeStandardsControlsHttp.js.map