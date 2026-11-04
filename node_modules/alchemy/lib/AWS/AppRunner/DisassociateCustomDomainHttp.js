import * as apprunner from "@distilled.cloud/aws/apprunner";
import { makeAppRunnerHttpBinding } from "./BindingHttp.js";
import { DisassociateCustomDomain } from "./DisassociateCustomDomain.js";
/**
 * HTTP implementation of the {@link DisassociateCustomDomain} binding.
 * Calls `apprunner:DisassociateCustomDomain` with the Lambda's IAM role,
 * scoped to the bound service.
 */
export const DisassociateCustomDomainHttp = makeAppRunnerHttpBinding(DisassociateCustomDomain, {
    operation: apprunner.disassociateCustomDomain,
    spec: (service) => ({
        identifiers: { ServiceArn: service.serviceArn },
        iam: () => ({
            actions: ["apprunner:DisassociateCustomDomain"],
            resources: [service.serviceArn],
        }),
    }),
});
//# sourceMappingURL=DisassociateCustomDomainHttp.js.map