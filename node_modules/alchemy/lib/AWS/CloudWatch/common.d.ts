import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Effect from "effect/Effect";
export type CloudWatchTags = Record<string, string>;
export declare const createName: (id: string, providedName: string | undefined, maxLength: number) => Effect.Effect<string, never, import("../../InstanceId.ts").InstanceId | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export declare const toTagRecord: (tags: cloudwatch.Tag[] | undefined) => CloudWatchTags;
export declare const createManagedTags: (id: string, tags: Record<string, string> | undefined) => Effect.Effect<{
    "alchemy::stack": string;
    "alchemy::stage": string;
    "alchemy::id": string;
}, never, import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export declare const updateResourceTags: (args_0: {
    id: string;
    resourceArn: string;
    olds: Record<string, string> | undefined;
    news: Record<string, string> | undefined;
}) => Effect.Effect<{
    "alchemy::stack": string;
    "alchemy::stage": string;
    "alchemy::id": string;
}, cloudwatch.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export declare const readResourceTags: (resourceArn: string) => Effect.Effect<CloudWatchTags, cloudwatch.ListTagsForResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export declare const createTagList: (tags: Record<string, string>) => {
    Key: string;
    Value: string;
}[];
export declare const retryConcurrent: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
export declare const detectorIdentity: (input: Pick<cloudwatch.PutAnomalyDetectorInput, "Namespace" | "MetricName" | "Dimensions" | "Stat" | "SingleMetricAnomalyDetector" | "MetricMathAnomalyDetector">) => string;
export declare const matchesDetectorIdentity: (detector: cloudwatch.AnomalyDetector, input: cloudwatch.PutAnomalyDetectorInput) => boolean;
export declare const sortByLogicalId: <T extends {
    LogicalId: string;
}>(items: T[]) => T[];
//# sourceMappingURL=common.d.ts.map