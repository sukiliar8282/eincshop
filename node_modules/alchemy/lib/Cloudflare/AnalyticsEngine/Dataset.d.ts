import * as Effect from "effect/Effect";
type TypeId = typeof TypeId;
declare const TypeId: "Cloudflare.AnalyticsEngine.Dataset";
export type DatasetProps = {
    /**
     * Dataset name. If omitted, the logical ID is used.
     */
    dataset?: string;
};
/**
 * A Cloudflare Workers Analytics Engine dataset binding.
 *
 * Analytics Engine datasets are configured as Worker bindings. The binding
 * exposes `writeDataPoint()` at runtime and does not require separate
 * provisioning through the Cloudflare API.
 *
 *
 * ### Binding to a Worker
 * **Example:** Basic Analytics Engine binding
 * ```typescript
 * const Analytics = yield* Cloudflare.AnalyticsEngine.Dataset("Analytics", {
 *   dataset: "app-events",
 * });
 *
 * export const Worker = Cloudflare.Worker("Worker", {
 *   main: "./src/worker.ts",
 *   bindings: { Analytics },
 * });
 * ```
 *
 * **Example:** Effect-style worker
 * ```typescript
 * const analytics = yield* Cloudflare.AnalyticsEngine.WriteDataset(Analytics);
 * yield* analytics.writeDataPoint({ blobs: ["signup"] });
 * ```
 *
 * @resource
 */
export type Dataset = {
    kind: TypeId;
    name: string;
    dataset: string;
};
export declare const isDataset: (value: unknown) => value is Dataset;
export declare const Dataset: {
    (name: string, props?: DatasetProps): Effect.Effect<Dataset>;
};
export {};
//# sourceMappingURL=Dataset.d.ts.map