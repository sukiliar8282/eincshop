import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Layer from "effect/Layer";
import { makeDevOpsGuruAccountHttpBinding } from "./BindingHttp.js";
import { DescribeResourceCollectionHealth } from "./DescribeResourceCollectionHealth.js";
export const DescribeResourceCollectionHealthHttp = Layer.effect(DescribeResourceCollectionHealth, makeDevOpsGuruAccountHttpBinding({
    tag: "AWS.DevOpsGuru.DescribeResourceCollectionHealth",
    operation: devopsguru.describeResourceCollectionHealth,
    actions: ["devops-guru:DescribeResourceCollectionHealth"],
}));
//# sourceMappingURL=DescribeResourceCollectionHealthHttp.js.map