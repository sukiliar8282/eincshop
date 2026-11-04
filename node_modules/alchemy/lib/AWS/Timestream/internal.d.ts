import { Endpoint } from "@distilled.cloud/aws";
import * as TSQ from "@distilled.cloud/aws/timestream-query";
import * as TSW from "@distilled.cloud/aws/timestream-write";
import * as Effect from "effect/Effect";
/**
 * Amazon Timestream uses the **endpoint discovery** pattern: control-plane and
 * data-plane requests must be routed to a cell-specific endpoint returned by
 * `DescribeEndpoints`, not the static regional endpoint (which answers every
 * operation other than `DescribeEndpoints` with `UnknownOperationException`).
 *
 * These helpers call `DescribeEndpoints` once, cache the discovered address for
 * its advertised `CachePeriodInMinutes`, and wrap a distilled Timestream effect
 * so it targets the discovered endpoint via the `Endpoint` service override.
 */
type Kind = "write" | "query";
/**
 * Discover (and cache) the cell-specific endpoint for `kind`, using the given
 * `DescribeEndpoints` effect. Parameterized over the discovery effect so each
 * caller carries only its own service module's error union — and so binding
 * layers can pass an operation captured via yield-first (`yield* op`) whose
 * calls are requirement-free.
 */
export declare const discover: <E, R>(kind: Kind, describe: Effect.Effect<{
    Endpoints: {
        Address: string;
        CachePeriodInMinutes: number;
    }[];
}, E, R>) => Effect.Effect<string, E, R>;
/**
 * Wrap a distilled Timestream effect so it targets the endpoint produced by
 * `discovered` (see {@link discover}) via the `Endpoint` service override.
 */
export declare const withEndpoint: <EDisc, RDisc>(discovered: Effect.Effect<string, EDisc, RDisc>) => <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E | EDisc, Exclude<R, Endpoint.Endpoint> | RDisc>;
/**
 * Route a distilled `timestream-write` effect through the discovered ingest
 * endpoint. Adds `DescribeEndpoints`'s error union (including the synthetic
 * `TimestreamNotOnboarded` tag) to the wrapped effect's errors.
 */
export declare const withWriteEndpoint: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E | TSW.DescribeEndpointsError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | Exclude<R, Endpoint.Endpoint>>;
/**
 * Route a distilled `timestream-query` effect through the discovered query
 * endpoint.
 */
export declare const withQueryEndpoint: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E | TSQ.DescribeEndpointsError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | Exclude<R, Endpoint.Endpoint>>;
export {};
//# sourceMappingURL=internal.d.ts.map