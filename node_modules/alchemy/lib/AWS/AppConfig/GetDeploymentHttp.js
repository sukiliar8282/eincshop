import * as appconfig from "@distilled.cloud/aws/appconfig";
import * as Output from "../../Output.js";
import { makeAppConfigHttpBinding } from "./BindingHttp.js";
import { GetDeployment } from "./GetDeployment.js";
/**
 * HTTP implementation of the {@link GetDeployment} binding. Calls
 * `appconfig:GetDeployment` with the Lambda's IAM role, scoped to the bound
 * environment's deployments.
 */
export const GetDeploymentHttp = makeAppConfigHttpBinding(GetDeployment, {
    operation: appconfig.getDeployment,
    spec: (application, environment) => ({
        identifiers: {
            ApplicationId: application.applicationId,
            EnvironmentId: environment.environmentId,
        },
        // The live authorizer evaluates the parent container ARNs (application,
        // environment) in addition to the deployment — observed via CloudTrail.
        iam: ({ region, accountId }) => ({
            actions: ["appconfig:GetDeployment"],
            resources: [
                Output.interpolate `arn:aws:appconfig:${region}:${accountId}:application/${application.applicationId}`,
                Output.interpolate `arn:aws:appconfig:${region}:${accountId}:application/${application.applicationId}/environment/${environment.environmentId}`,
                Output.interpolate `arn:aws:appconfig:${region}:${accountId}:application/${application.applicationId}/environment/${environment.environmentId}/deployment/*`,
            ],
        }),
    }),
});
//# sourceMappingURL=GetDeploymentHttp.js.map