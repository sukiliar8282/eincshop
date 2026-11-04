import * as apprunner from "@distilled.cloud/aws/apprunner";
import { makeAppRunnerHttpBinding } from "./BindingHttp.js";
import { ListOperations } from "./ListOperations.js";
/**
 * HTTP implementation of the {@link ListOperations} binding. Calls
 * `apprunner:ListOperations` with the Lambda's IAM role, scoped to the
 * bound service.
 */
export const ListOperationsHttp = makeAppRunnerHttpBinding(ListOperations, {
    operation: apprunner.listOperations,
    spec: (service) => ({
        identifiers: { ServiceArn: service.serviceArn },
        iam: () => ({
            actions: ["apprunner:ListOperations"],
            resources: [service.serviceArn],
        }),
    }),
});
//# sourceMappingURL=ListOperationsHttp.js.map