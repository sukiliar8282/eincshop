import { Region as AwsRegion } from "@distilled.cloud/aws/Region";
import * as Effect from "effect/Effect";
export declare const PRICING_REGION: "us-east-1";
export declare const withPricingRegion: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, Exclude<R, AwsRegion>>;
//# sourceMappingURL=internal.d.ts.map