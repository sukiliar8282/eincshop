import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AlertManagerDefinitionProps {
    /**
     * Id of the AMP workspace this alert manager definition belongs to. A
     * workspace has at most one alert manager definition. Changing the
     * workspace replaces the definition.
     */
    workspaceId: string;
    /**
     * The Alertmanager configuration as a YAML document (the `alertmanager.yml`
     * shape, with `alertmanager_config` and optional `template_files` keys).
     * Updated in place.
     */
    definition: string;
}
export interface AlertManagerDefinition extends Resource<"AWS.AMP.AlertManagerDefinition", AlertManagerDefinitionProps, {
    workspaceId: string;
    status: string;
}, never, Providers> {
}
/**
 * The Alertmanager definition for an Amazon Managed Service for Prometheus
 * workspace — configures how firing alerts are grouped, routed, and
 * dispatched to receivers (SNS, etc.). A workspace has at most one.
 *
 * ### Creating an Alert Manager Definition
 * **Example:** Basic Definition
 * ```typescript
 * const workspace = yield* AMP.Workspace("Metrics", {});
 * const alerts = yield* AMP.AlertManagerDefinition("Alerts", {
 *   workspaceId: workspace.workspaceId,
 *   definition: `alertmanager_config: |
 *   route:
 *     receiver: default
 *   receivers:
 *     - name: default`,
 * });
 * ```
 *
 * @resource
 */
export declare const AlertManagerDefinition: import("../../Resource.ts").ResourceClass<AlertManagerDefinition>;
export declare const AlertManagerDefinitionProvider: () => import("effect/Layer").Layer<Provider.Provider<AlertManagerDefinition>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=AlertManagerDefinition.d.ts.map