import * as appconfig from "@distilled.cloud/aws/appconfig";
import * as Output from "../../Output.js";
import { makeAppConfigHttpBinding } from "./BindingHttp.js";
import { StartDeployment } from "./StartDeployment.js";
/**
 * HTTP implementation of the {@link StartDeployment} binding. Calls
 * `appconfig:StartDeployment` with the Lambda's IAM role, scoped to the bound
 * application, environment, configuration profile, and deployment strategy.
 */
export const StartDeploymentHttp = makeAppConfigHttpBinding(StartDeployment, {
    operation: appconfig.startDeployment,
    spec: (application, environment, configurationProfile, deploymentStrategy) => ({
        identifiers: {
            ApplicationId: application.applicationId,
            EnvironmentId: environment.environmentId,
            ConfigurationProfileId: configurationProfile.configurationProfileId,
            DeploymentStrategyId: deploymentStrategy.deploymentStrategyId,
        },
        iam: ({ region, accountId }) => ({
            actions: ["appconfig:StartDeployment"],
            resources: [
                Output.interpolate `arn:aws:appconfig:${region}:${accountId}:application/${application.applicationId}`,
                Output.interpolate `arn:aws:appconfig:${region}:${accountId}:application/${application.applicationId}/environment/${environment.environmentId}`,
                Output.interpolate `arn:aws:appconfig:${region}:${accountId}:application/${application.applicationId}/configurationprofile/${configurationProfile.configurationProfileId}`,
                Output.interpolate `arn:aws:appconfig:${region}:${accountId}:deploymentstrategy/${deploymentStrategy.deploymentStrategyId}`,
            ],
        }),
    }),
});
//# sourceMappingURL=StartDeploymentHttp.js.map