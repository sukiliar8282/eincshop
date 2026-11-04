import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface HostedConfigurationVersionProps {
    /**
     * ID of the application. Changing it replaces the version.
     */
    applicationId: string;
    /**
     * ID of the (hosted) configuration profile. Changing it replaces the
     * version.
     */
    configurationProfileId: string;
    /**
     * The configuration content itself — the YAML/JSON/text document served to
     * clients. Hosted configuration versions are immutable; changing the
     * content creates a new version (a replacement).
     */
    content: string;
    /**
     * MIME type of the content, e.g. `application/json`, `application/x-yaml`,
     * or `text/plain`.
     */
    contentType: string;
    /**
     * Description of the configuration version.
     */
    description?: string;
    /**
     * A user-defined label for the version (e.g. a git SHA). Must be unique per
     * profile.
     */
    versionLabel?: string;
}
export interface HostedConfigurationVersion extends Resource<"AWS.AppConfig.HostedConfigurationVersion", HostedConfigurationVersionProps, {
    applicationId: string;
    configurationProfileId: string;
    versionNumber: number;
    contentType: string;
    versionLabel: string | undefined;
}, never, Providers> {
}
/**
 * An AWS AppConfig hosted configuration version — the actual configuration
 * content stored in the AppConfig hosted store. Versions are immutable: each
 * change to the content produces a new version (a replacement), and its
 * `versionNumber` is what you deploy through a {@link Deployment}.
 *
 * ### Creating a Hosted Configuration Version
 * **Example:** JSON Configuration
 * ```typescript
 * const version = yield* AppConfig.HostedConfigurationVersion("V1", {
 *   applicationId: app.applicationId,
 *   configurationProfileId: profile.configurationProfileId,
 *   content: JSON.stringify({ featureX: true }),
 *   contentType: "application/json",
 * });
 * // version.versionNumber -> 1
 * ```
 *
 * @resource
 */
export declare const HostedConfigurationVersion: import("../../Resource.ts").ResourceClass<HostedConfigurationVersion>;
export declare const HostedConfigurationVersionProvider: () => import("effect/Layer").Layer<Provider.Provider<HostedConfigurationVersion>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=HostedConfigurationVersion.d.ts.map