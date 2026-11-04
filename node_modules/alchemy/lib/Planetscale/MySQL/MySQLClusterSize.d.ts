import * as ps from "@distilled.cloud/planetscale";
import * as Effect from "effect/Effect";
import { PlanetscaleConflict } from "../Util.ts";
/**
 * Available PlanetScale MySQL (Vitess) cluster sizes.
 *
 * `PS_*` sizes are backed by network-attached storage (NAS) and can be
 * specified either as the short size (`"PS_10"`) or the API SKU
 * (`"PS_10_AWS_X86"`)
 *
 * @see https://planetscale.com/docs/concepts/planetscale-skus
 */
export type MySQLClusterSize = "PS_DEV" | "PS_5" | "PS_10" | "PS_20" | "PS_40" | "PS_80" | "PS_160" | "PS_320" | "PS_400" | "PS_640" | "PS_700" | "PS_900" | "PS_1280" | "PS_1400" | "PS_1800" | "PS_2100" | "PS_2560" | "PS_2700" | "PS_2800" | (string & {});
/**
 * Polls keyspaces in a branch until the named keyspace reports
 * `resizing === false` (i.e. any in-flight resize has completed).
 */
export declare const waitForKeyspaceReady: (organization: string, database: string, branch: string, keyspace: string) => Effect.Effect<void, ps.ListKeyspacesError, ps.PlanetScaleOpContext>;
/**
 * Observes the total replica count of a branch's default keyspace, or
 * `undefined` when the branch or keyspace does not exist (yet).
 */
export declare const observeDefaultKeyspaceReplicas: (organization: string, database: string, branch: string) => Effect.Effect<number | undefined, ps.BadGateway | ps.BadRequest | ps.ConfigError | ps.Conflict | ps.Forbidden | ps.Services.planetscale.Forbidden | ps.GatewayTimeout | import("effect/unstable/http/HttpClientError").HttpClientError | ps.InternalServerError | ps.Locked | ps.ServiceUnavailable | ps.TooManyRequests | ps.Unauthorized | ps.UnknownPlanetScaleError | ps.UnprocessableEntity, ps.PlanetScaleOpContext>;
/**
 * Ensures the default keyspace of a MySQL production branch has the
 * expected cluster size and (optionally) total replica count, driving
 * PlanetScale's in-place keyspace resize lifecycle when it doesn't.
 * Cluster sizes can only be configured on production branches. Returns
 * the final observed keyspace.
 */
export declare const ensureMySQLProductionBranchClusterSize: (organization: string, database: string, branch: string, expectedClusterSize: MySQLClusterSize, expectedReplicas?: number | undefined) => Effect.Effect<ps.PaginatedDatabaseBranchKeyspaceDataItem, ps.BadGateway | ps.BadRequest | ps.ConfigError | ps.Conflict | ps.Forbidden | ps.Services.planetscale.Forbidden | ps.GatewayTimeout | import("effect/unstable/http/HttpClientError").HttpClientError | ps.InternalServerError | ps.Locked | ps.NotFound | ps.Services.planetscale.NotFound | PlanetscaleConflict | ps.ServiceUnavailable | ps.TooManyRequests | ps.Unauthorized | ps.UnknownPlanetScaleError | ps.UnprocessableEntity | ps.Services.planetscale.UnprocessableEntity, ps.PlanetScaleOpContext>;
//# sourceMappingURL=MySQLClusterSize.d.ts.map