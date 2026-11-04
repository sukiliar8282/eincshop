import * as glacier from "@distilled.cloud/aws/glacier";
import * as Layer from "effect/Layer";
import { makeGlacierVaultHttpBinding } from "./BindingHttp.js";
import { DescribeVault } from "./DescribeVault.js";
export const DescribeVaultHttp = Layer.effect(DescribeVault, makeGlacierVaultHttpBinding({
    tag: "AWS.Glacier.DescribeVault",
    operation: glacier.describeVault,
    actions: ["glacier:DescribeVault"],
}));
//# sourceMappingURL=DescribeVaultHttp.js.map