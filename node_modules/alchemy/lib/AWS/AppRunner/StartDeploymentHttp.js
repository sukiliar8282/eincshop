import * as apprunner from "@distilled.cloud/aws/apprunner";
import { makeAppRunnerHttpBinding } from "./BindingHttp.js";
import { StartDeployment } from "./StartDeployment.js";
/**
 * HTTP implementation of the {@link StartDeployment} binding. Calls
 * `apprunner:StartDeployment` with the Lambda's IAM role, scoped to the
 * bound service.
 */
export const StartDeploymentHttp = makeAppRunnerHttpBinding(StartDeployment, {
    operation: apprunner.startDeployment,
    spec: (service) => ({
        identifiers: { ServiceArn: service.serviceArn },
        iam: () => ({
            actions: ["apprunner:StartDeployment"],
            resources: [service.serviceArn],
        }),
    }),
});
//# sourceMappingURL=StartDeploymentHttp.js.map