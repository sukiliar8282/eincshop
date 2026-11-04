import * as appconfig from "@distilled.cloud/aws/appconfig";
import * as Output from "../../Output.js";
import { makeAppConfigHttpBinding } from "./BindingHttp.js";
import { ValidateConfiguration } from "./ValidateConfiguration.js";
/**
 * HTTP implementation of the {@link ValidateConfiguration} binding. Calls
 * `appconfig:ValidateConfiguration` with the Lambda's IAM role, scoped to
 * the bound configuration profile.
 */
export const ValidateConfigurationHttp = makeAppConfigHttpBinding(ValidateConfiguration, {
    operation: appconfig.validateConfiguration,
    spec: (application, configurationProfile) => ({
        identifiers: {
            ApplicationId: application.applicationId,
            ConfigurationProfileId: configurationProfile.configurationProfileId,
        },
        // The service authorization reference lists configurationprofile +
        // hostedconfigurationversion, but the LIVE authorizer evaluates the
        // APPLICATION ARN (CloudTrail: "not authorized to perform:
        // appconfig:ValidateConfiguration on resource: ...:application/{id}").
        // Grant all three.
        iam: ({ region, accountId }) => ({
            actions: ["appconfig:ValidateConfiguration"],
            resources: [
                Output.interpolate `arn:aws:appconfig:${region}:${accountId}:application/${application.applicationId}`,
                Output.interpolate `arn:aws:appconfig:${region}:${accountId}:application/${application.applicationId}/configurationprofile/${configurationProfile.configurationProfileId}`,
                Output.interpolate `arn:aws:appconfig:${region}:${accountId}:application/${application.applicationId}/configurationprofile/${configurationProfile.configurationProfileId}/hostedconfigurationversion/*`,
            ],
        }),
    }),
});
//# sourceMappingURL=ValidateConfigurationHttp.js.map