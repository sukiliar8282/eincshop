import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface EventSourcesConfigProps {
    /**
     * Consume Amazon CodeGuru Profiler recommendations as an event source so
     * DevOps Guru can surface them as proactive insights.
     * @default false
     */
    amazonCodeGuruProfiler?: boolean;
}
export interface EventSourcesConfig extends Resource<"AWS.DevOpsGuru.EventSourcesConfig", EventSourcesConfigProps, {
    /** Whether CodeGuru Profiler recommendations are consumed. */
    amazonCodeGuruProfiler: boolean;
}, never, Providers> {
}
/**
 * The DevOps Guru event sources configuration — the account/region singleton
 * that controls which integrated services DevOps Guru consumes
 * recommendations from as event sources. The one supported source is Amazon
 * CodeGuru Profiler: when enabled, profiler recommendations surface as
 * DevOps Guru proactive insights.
 *
 * An account has exactly one configuration, so this resource is a
 * capture-and-restore singleton: adopting an enabled configuration that
 * Alchemy did not create requires `--adopt`. Destroying the resource
 * restores the default (disabled).
 *
 * ### Enabling Event Sources
 * **Example:** Consume CodeGuru Profiler Recommendations
 * ```typescript
 * const eventSources = yield* DevOpsGuru.EventSourcesConfig("EventSources", {
 *   amazonCodeGuruProfiler: true,
 * });
 * ```
 *
 * @resource
 */
export declare const EventSourcesConfig: import("../../Resource.ts").ResourceClass<EventSourcesConfig>;
export declare const EventSourcesConfigProvider: () => import("effect/Layer").Layer<Provider.Provider<EventSourcesConfig>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=EventSourcesConfig.d.ts.map