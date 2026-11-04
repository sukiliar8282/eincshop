import type { Effect } from "effect/Effect";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import type { Sink } from "effect/Sink";
import type { Stream } from "effect/Stream";
export * from "effect/Schema";
export declare const isNullishSchema: (schema: S.Schema<any>) => boolean;
export declare const isNullSchema: (schema: S.Schema<any>) => boolean;
export declare const isUndefinedSchema: (schema: S.Schema<any>) => boolean;
export declare const isBooleanSchema: (schema: S.Schema<any>) => boolean;
export declare const isStringSchema: (schema: S.Schema<any>) => boolean;
export declare const isNumberSchema: (schema: S.Schema<any>) => boolean;
export declare const isRecordLikeSchema: (schema: S.Schema<any>) => boolean;
export declare const isMapSchema: (schema: S.Schema<any>) => boolean;
export declare const isClassSchema: (schema: S.Schema<any>) => boolean;
export declare const isStructSchema: (schema: S.Schema<any>) => boolean;
export declare const isRecordSchema: (schema: S.Schema<any>) => boolean;
export declare const isListSchema: (schema: S.Schema<any>) => boolean;
export declare const isSetSchema: (schema: S.Schema<any>) => boolean;
export declare const getSetValueAST: (schema: S.Schema<any>) => AST.AST | undefined;
/** A Schema representing a Schema */
export type Field = S.Top;
export declare const Field: S.suspend<S.Schema<S.Top>>;
type FunctionType = (...args: any[]) => any;
export type Function<F extends FunctionType = FunctionType> = S.Schema<F>;
export declare const Function: <F extends FunctionType>() => Function<F>;
export type CreatedAt = Date;
export declare const CreatedAt: S.Date;
export type UpdatedAt = Date;
export declare const UpdatedAt: S.Date;
export type AnyClassSchema<Self = any, Fields extends S.Top & {
    fields: S.Struct.Fields;
} = S.Top & {
    fields: S.Struct.Fields;
}> = S.Class<Self, Fields, any>;
export type AnyClass = new (...args: any[]) => any;
export type AnyErrorSchema = S.Class<any, any, any>;
export type SchemaWithTemplate<Schema extends S.Schema<any>, References extends any[] = any[]> = Schema & {
    template: TemplateStringsArray;
    references: References;
};
export type SchemaExt = FunctionSchema | EffectSchema | StreamSchema | SinkSchema;
export interface SchemaExtBase<A> extends S.Schema<A> {
    <References extends any[]>(template: TemplateStringsArray, ...references: References): SchemaWithTemplate<this, References>;
}
export interface FunctionSchema<Input extends S.Top | undefined = S.Top | undefined, Output extends S.Top = S.Top> extends SchemaExtBase<(...args: Input extends undefined ? [] : [input: S.Schema.Type<Exclude<Input, undefined>>]) => S.Schema.Type<Output>> {
    input: Input;
    output: Output;
}
export interface EffectSchema<A extends S.Top = S.Top, Err extends S.Top = S.Top, Req extends S.Top = S.Top> extends SchemaExtBase<Effect<S.Schema.Type<A>, S.Schema.Type<Err>, S.Schema.Type<Req>>> {
    A: A;
    Err: Err;
    Req: Req;
}
export interface StreamSchema<A extends S.Top = S.Top, Err extends S.Top = S.Top, Req extends S.Top = S.Top> extends SchemaExtBase<Stream<S.Schema.Type<A>, S.Schema.Type<Err>, S.Schema.Type<Req>>> {
    A: A;
    Err: Err;
    Req: Req;
}
export interface SinkSchema<A extends S.Top = S.Top, In extends S.Top = S.Top, L extends S.Top = S.Top, Err extends S.Top = S.Top, Req extends S.Top = S.Top> extends SchemaExtBase<Sink<S.Schema.Type<A>, S.Schema.Type<In>, S.Schema.Type<L>, S.Schema.Type<Err>, S.Schema.Type<Req>>> {
    A: A;
    In: In;
    L: L;
    Err: Err;
    Req: Req;
}
export declare const makeExtSchema: <Schema extends SchemaExt>(schema: Schema) => SchemaExt;
export interface func<Input extends undefined | S.Top | S.Top[], Output extends S.Top> extends S.Schema<Input extends undefined ? () => S.Schema.Type<Output> : Input extends S.Top[] ? (...args: TypeArray<Input>) => S.Schema.Type<Output> : (input: S.Schema.Type<Extract<Input, S.Top>>) => S.Schema.Type<Output>> {
}
type TypeArray<T extends S.Top[]> = T extends [
    infer Head,
    ...infer Tail extends S.Top[]
] ? Head extends S.Top ? [S.Schema.Type<Head>, ...TypeArray<Tail>] : never : [];
export declare const func: {
    <Output extends S.Schema<any>>(output: Output): func<undefined, Output> & {
        <R extends any[]>(template: TemplateStringsArray, ...references: R): SchemaWithTemplate<func<undefined, Output>, R>;
    };
    <Input extends S.Schema<any>, Output extends S.Schema<any>>(input: Input, output: Output): func<Input, Output> & {
        <R extends any[]>(template: TemplateStringsArray, ...references: R): SchemaWithTemplate<func<Input, Output>, R>;
    };
    <const Args extends S.Schema<any>[], Output extends S.Schema<any>>(args: Args, output: Output): func<Args, Output> & {
        <R extends any[]>(template: TemplateStringsArray, ...references: R): SchemaWithTemplate<func<Args, Output>, R>;
    };
};
export interface effect<A extends S.Top, Err extends S.Top, Req extends S.Top> extends S.Schema<Effect<S.Schema.Type<A>, S.Schema.Type<Err>, S.Schema.Type<Req>>> {
}
export declare const effect: <A extends S.Schema<any>, Err extends S.Schema<any> | S.Never = S.Never, Req extends S.Schema<any> | S.Any = S.Any>(a: A, err?: Err, req?: Req) => effect<A, Err, Req>;
export declare const stream: <A extends S.Schema<any>, Err extends S.Schema<any> | S.Never = S.Never, Req extends S.Schema<any> | S.Never = S.Never>(a: A, err?: Err, req?: Req) => S.Any;
export declare const sink: <A extends S.Schema<any>, In extends S.Schema<any>, L extends S.Schema<any>, Err extends S.Schema<any> | S.Never = S.Never, Req extends S.Schema<any> | S.Never = S.Never>(a: A, _in?: In, l?: L, err?: Err, req?: Req) => S.Any;
//# sourceMappingURL=Schema.d.ts.map