import * as Effect from "effect/Effect";
export declare const toTagRecord: (tags: Array<{
    Key?: string;
    Value?: string;
}> | undefined) => Record<string, string>;
/** Read tags after a resource has reached an observable state. */
export declare const readElastiCacheTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export declare const sameStringSet: (a: readonly string[] | undefined, b: readonly string[] | undefined) => boolean;
export declare const tagsToWire: (tags: Record<string, string>) => {
    Key: string;
    Value: string;
}[];
//# sourceMappingURL=internal.d.ts.map