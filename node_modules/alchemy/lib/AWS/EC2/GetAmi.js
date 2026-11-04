import * as Binding from "../../Binding.js";
export const GetAmi = Binding.Service("AWS.EC2.GetAmi");
/**
 * Plan-time AMI lookup — the data-source form of {@link GetAmi} (what
 * Terraform calls a data source and Pulumi an invoke). Returns an
 * `Output<ec2.Image | undefined>` resolved during plan/deploy; safe to call
 * from composition code that is re-executed inside a deployed runtime
 * bundle. Prefer {@link image} (or the distro presets) when you only need
 * the AMI ID and want a missing image to fail the plan.
 */
export const getAmi = GetAmi.execute;
//# sourceMappingURL=GetAmi.js.map