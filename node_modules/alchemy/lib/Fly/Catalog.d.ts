import type { MainRegionRow } from "@distilled.cloud/fly-io/machines";
import * as machines from "@distilled.cloud/fly-io/machines";
import * as Effect from "effect/Effect";
export type CatalogKind = "region" | "org";
declare const CatalogNotFound_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.CatalogNotFound";
} & Readonly<A>;
export declare class CatalogNotFound extends CatalogNotFound_base<{
    kind: CatalogKind;
    ref: string;
}> {
}
/**
 * Current token organization slug (`getCurrentToken` → `tokens[0].org_slug`).
 * Feeds `listApps({ org_slug })`. Not a resource.
 */
export declare const currentOrgSlug: () => Effect.Effect<string, import("./Environment.ts").FlyOrgNotFound | machines.GetCurrentTokenError, machines.FlyIoOpContext>;
/**
 * List Fly platform regions via `getRegions`.
 */
export declare const listRegions: () => Effect.Effect<machines.MainRegionResponseRegionsList, machines.GetRegionsError, machines.FlyIoOpContext>;
/**
 * Resolve a Fly region by code (`iad`, `ord`, `sjc`, …).
 */
export declare const findRegion: (code: string) => Effect.Effect<MainRegionRow, CatalogNotFound | machines.GetRegionsError, machines.FlyIoOpContext>;
export type FlyRegion = MainRegionRow;
export {};
//# sourceMappingURL=Catalog.d.ts.map