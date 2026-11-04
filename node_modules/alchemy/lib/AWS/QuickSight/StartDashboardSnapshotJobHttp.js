import * as quicksight from "@distilled.cloud/aws/quicksight";
import * as Layer from "effect/Layer";
import { makeQuickSightDashboardHttpBinding } from "./BindingHttp.js";
import { StartDashboardSnapshotJob } from "./StartDashboardSnapshotJob.js";
export const StartDashboardSnapshotJobHttp = Layer.effect(StartDashboardSnapshotJob, makeQuickSightDashboardHttpBinding({
    tag: "AWS.QuickSight.StartDashboardSnapshotJob",
    operation: quicksight.startDashboardSnapshotJob,
    actions: ["quicksight:StartDashboardSnapshotJob"],
}));
//# sourceMappingURL=StartDashboardSnapshotJobHttp.js.map