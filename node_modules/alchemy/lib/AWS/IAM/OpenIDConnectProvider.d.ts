import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface OpenIDConnectProviderProps {
    /**
     * The identity provider URL.
     */
    url: string;
    /**
     * Client IDs allowed for the provider. AWS rejects requests with an
     * empty list, so the prop is typed as a non-empty tuple.
     */
    clientIDList?: [string, ...string[]];
    /**
     * Certificate thumbprints for the provider. AWS auto-manages thumbprints
     * for well-known IdPs (e.g. GitHub Actions), so this is optional — but
     * `iam.updateOpenIDConnectProviderThumbprint` rejects an empty list, so
     * the prop is typed as a non-empty tuple when supplied.
     */
    thumbprintList?: [string, ...string[]];
    /**
     * User-defined tags to apply to the provider.
     */
    tags?: Record<string, string>;
}
export interface OpenIDConnectProvider extends Resource<"AWS.IAM.OpenIDConnectProvider", OpenIDConnectProviderProps, {
    /** The ARN of the OIDC provider. */
    openIDConnectProviderArn: string;
    /** The URL of the identity provider. */
    url: string;
    /** The client IDs (audiences) registered with the provider. */
    clientIDList: string[];
    /**
     * Reflects the desired state — `undefined` when the user opted out of
     * managing thumbprints (AWS auto-manages them for well-known IdPs).
     */
    thumbprintList: string[] | undefined;
    /** The tags applied to the provider. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An IAM OpenID Connect provider for web identity federation.
 *
 * `OpenIDConnectProvider` registers an external OIDC issuer so IAM roles can be
 * assumed through web identity federation flows such as GitHub Actions.
 * ### Federating with OIDC
 * **Example:** Create a GitHub Actions OIDC Provider
 * ```typescript
 * const oidc = yield* OpenIDConnectProvider("GithubOidc", {
 *   url: "https://token.actions.githubusercontent.com",
 *   clientIDList: ["sts.amazonaws.com"],
 *   thumbprintList: ["6938fd4d98bab03faadb97b34396831e3780aea1"],
 * });
 * ```
 *
 * @resource
 */
export declare const OpenIDConnectProvider: import("../../Resource.ts").ResourceClass<OpenIDConnectProvider>;
export declare const OpenIDConnectProviderProvider: () => import("effect/Layer").Layer<Provider.Provider<OpenIDConnectProvider>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=OpenIDConnectProvider.d.ts.map