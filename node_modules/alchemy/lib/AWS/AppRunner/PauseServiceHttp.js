import * as apprunner from "@distilled.cloud/aws/apprunner";
import { makeAppRunnerHttpBinding } from "./BindingHttp.js";
import { PauseService } from "./PauseService.js";
/**
 * HTTP implementation of the {@link PauseService} binding. Calls
 * `apprunner:PauseService` with the Lambda's IAM role, scoped to the bound
 * service.
 */
export const PauseServiceHttp = makeAppRunnerHttpBinding(PauseService, {
    operation: apprunner.pauseService,
    spec: (service) => ({
        identifiers: { ServiceArn: service.serviceArn },
        iam: () => ({
            actions: ["apprunner:PauseService"],
            resources: [service.serviceArn],
        }),
    }),
});
//# sourceMappingURL=PauseServiceHttp.js.map