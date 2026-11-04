import * as Region from "@distilled.cloud/aws/Region";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { AWSEnvironment } from "./Environment.ts";
export { AWS_REGION, type RegionID } from "./Environment.ts";
export { Region } from "@distilled.cloud/aws/Region";
declare module "@distilled.cloud/aws/Region" {
    interface Region {
        readonly kind: "Environment";
    }
}
export declare const of: (region: string) => Layer.Layer<Region.Region, never, never>;
export declare const fromEnvOrElse: (region: string) => Layer.Layer<Region.Region, never, never>;
export declare const CurrentRegion: Effect.Effect<string, never, AWSEnvironment>;
/**
 * Derive the AWS region from the surrounding {@link AWSEnvironment}.
 */
export declare const fromEnvironment: Layer.Layer<Region.Region, never, AWSEnvironment>;
//# sourceMappingURL=Region.d.ts.map