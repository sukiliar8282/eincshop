import type { Config } from "@distilled.cloud/fly-io";
import { Credentials } from "@distilled.cloud/fly-io";
import * as machines from "@distilled.cloud/fly-io/machines";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpClient from "effect/unstable/http/HttpClient";
declare const FlyOrgNotFound_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.OrgNotFound";
} & Readonly<A>;
export declare class FlyOrgNotFound extends FlyOrgNotFound_base<{
    message: string;
}> {
}
/**
 * Fully-resolved Fly.io environment for a stack.
 *
 * `{ apiKey, apiBaseUrl }` comes from distilled `Credentials`. `orgSlug` is
 * the current token's organization (`getCurrentToken` → `tokens[0].org_slug`),
 * cached for the process. Resolve it inside lifecycle operations with
 * `FlyEnvironment.current`.
 */
export type FlyEnvironmentShape = Config & {
    readonly orgSlug: string;
};
declare const FlyEnvironment_base: Context.ServiceClass<FlyEnvironment, "Fly::Environment", Effect.Effect<FlyEnvironmentShape, never, never>>;
export declare class FlyEnvironment extends FlyEnvironment_base {
    static current: Effect.Effect<FlyEnvironmentShape, never, FlyEnvironment>;
    readonly kind: "Environment";
}
/**
 * Discover the current token's organization slug via `getCurrentToken`.
 * Used by {@link fromCredentials} and by {@link Catalog.currentOrgSlug}.
 */
export declare const resolveOrgSlug: () => Effect.Effect<string, FlyOrgNotFound | machines.GetCurrentTokenError, machines.FlyIoOpContext>;
/**
 * Build a `FlyEnvironment` layer from the distilled `Credentials`
 * service. Provide this after `Credentials.fromAuthProvider()`.
 *
 * `orgSlug` is resolved from `getCurrentToken` and cached so App.list /
 * Catalog do not re-hit `/tokens/current` on every call.
 */
export declare const fromCredentials: () => Layer.Layer<FlyEnvironment, never, Credentials | HttpClient.HttpClient>;
export {};
//# sourceMappingURL=Environment.d.ts.map