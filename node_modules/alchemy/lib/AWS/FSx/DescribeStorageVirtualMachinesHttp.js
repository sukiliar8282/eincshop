import * as fsx from "@distilled.cloud/aws/fsx";
import * as Layer from "effect/Layer";
import { makeFSxAccountHttpBinding } from "./BindingHttp.js";
import { DescribeStorageVirtualMachines } from "./DescribeStorageVirtualMachines.js";
export const DescribeStorageVirtualMachinesHttp = Layer.effect(DescribeStorageVirtualMachines, makeFSxAccountHttpBinding({
    tag: "AWS.FSx.DescribeStorageVirtualMachines",
    operation: fsx.describeStorageVirtualMachines,
    actions: ["fsx:DescribeStorageVirtualMachines"],
}));
//# sourceMappingURL=DescribeStorageVirtualMachinesHttp.js.map