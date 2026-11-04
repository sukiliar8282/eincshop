import type { AttributeValue, ScalarAttributeType } from "@distilled.cloud/aws/dynamodb";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
declare const InvalidAttributeValue_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "InvalidAttributeValue";
} & Readonly<A>;
/**
 * Raised when a JavaScript value cannot be marshalled to a DynamoDB
 * `AttributeValue` (e.g. a function or symbol).
 */
export declare class InvalidAttributeValue extends InvalidAttributeValue_base<{
    message: string;
    value: any;
}> {
}
/**
 * Marshal a plain JavaScript value into a DynamoDB `AttributeValue`.
 *
 * @example Marshal a nested object
 * ```typescript
 * const item = yield* toAttributeValue({ name: "Alice", scores: [1, 2, 3] });
 * // { M: { name: { S: "Alice" }, scores: { L: [{ N: "1" }, ...] } } }
 * ```
 */
export declare const toAttributeValue: (value: any) => Effect.Effect<AttributeValue, InvalidAttributeValue, never>;
/**
 * Unmarshal a DynamoDB `AttributeValue` back into a plain JavaScript value
 * (inverse of {@link toAttributeValue}).
 */
export declare const fromAttributeValue: (value: AttributeValue) => any;
export declare const isScalarAttributeType: (type: string) => type is ScalarAttributeType;
export declare const toAttributeType: (schema: S.Schema<any>) => "L" | "M" | "N" | "NS" | "S" | "SS";
export declare const isMapSchemaType: (schema: S.Schema<any>) => boolean;
export declare const isStringSetSchema: (schema: S.Schema<any>) => boolean;
export declare const isNumberSetSchema: (schema: S.Schema<any>) => boolean;
export {};
//# sourceMappingURL=AttributeValue.d.ts.map