import * as Layer from "effect/Layer";
import * as Provider from "../Provider.ts";
declare const Providers_base: Provider.ProviderCollection<Providers, "Drizzle">;
export declare class Providers extends Providers_base {
}
export type ProviderRequirements = Layer.Services<ReturnType<typeof providers>>;
/**
 * Build-time providers for managing Drizzle schemas as Alchemy resources.
 * Drizzle.Schema regenerates migration SQL via drizzle-kit's programmatic
 * API on every deploy when the source schema changes.
 *
 * @example
 * ```typescript
 * import * as Alchemy from "alchemy";
 * import * as Cloudflare from "alchemy/Cloudflare";
 * import * as Drizzle from "alchemy/Drizzle";
 * import * as Neon from "alchemy/Neon";
 * import * as Effect from "effect/Effect";
 * import * as Layer from "effect/Layer";
 *
 * export default Alchemy.Stack(
 *   "MyStack",
 *   {
 *     providers: Layer.mergeAll(
 *       Cloudflare.providers(),
 *       Drizzle.providers(),
 *       Neon.providers(),
 *     ),
 *     state: Alchemy.localState(),
 *   },
 *   Effect.gen(function* () {
 *     const schema = yield* Drizzle.Schema("app-schema", {
 *       schema: "./src/schema.ts",
 *     });
 *     const project = yield* Neon.Project("app-db");
 *     const branch = yield* Neon.Branch("app-branch", {
 *       project,
 *       migrationsDir: schema.out,
 *     });
 *     return { branchId: branch.branchId };
 *   }),
 * );
 * ```
 */
export declare const providers: () => Layer.Layer<Providers, never, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("effect/Scope").Scope>;
export {};
//# sourceMappingURL=Providers.d.ts.map