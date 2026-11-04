import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
export * from "effect/Schema";
export const isNullishSchema = (schema) => isNullSchema(schema) || isUndefinedSchema(schema);
export const isNullSchema = (schema) => AST.isNull(schema.ast);
export const isUndefinedSchema = (schema) => AST.isUndefined(schema.ast);
export const isBooleanSchema = (schema) => AST.isBoolean(schema.ast);
export const isStringSchema = (schema) => AST.isString(schema.ast);
export const isNumberSchema = (schema) => AST.isNumber(schema.ast);
export const isRecordLikeSchema = (schema) => isMapSchema(schema) ||
    isRecordSchema(schema) ||
    isStructSchema(schema) ||
    isClassSchema(schema) ||
    false;
export const isMapSchema = (schema) => getDeclarationRepresentationId(schema.ast) === "effect/schema/ReadonlyMap";
export const isClassSchema = (schema) => {
    const ast = schema.ast;
    if (AST.isDeclaration(ast)) {
        return AST.isObjects(ast.typeParameters[0]);
    }
    return false;
};
export const isStructSchema = (schema) => {
    return AST.isObjects(schema.ast);
};
export const isRecordSchema = (schema) => {
    const ast = schema.ast;
    return AST.isObjects(ast) && ast.indexSignatures?.length > 0;
};
export const isListSchema = (schema) => {
    return AST.isArrays(schema.ast);
};
export const isSetSchema = (schema) => getDeclarationRepresentationId(schema.ast) === "effect/schema/ReadonlySet";
/**
 * Effect's built-in declaration schemas (ReadonlyMap, ReadonlySet, ...) carry a
 * `representation` annotation identifying the underlying type constructor.
 */
const getDeclarationRepresentationId = (ast) => {
    if (AST.isDeclaration(ast)) {
        return ast.annotations?.representation?.id;
    }
    return undefined;
};
export const getSetValueAST = (schema) => {
    const ast = schema.ast;
    if (AST.isDeclaration(ast) && isSetSchema(schema)) {
        return ast.typeParameters[0];
    }
    return undefined;
};
export const Field = S.suspend(() => S.Any);
export const Function = S.suspend(() => S.Any);
export const CreatedAt = S.Date.annotate({
    description: "The timestamp of when this record was created",
});
export const UpdatedAt = S.Date.annotate({
    description: "The timestamp of when this record was last updated",
});
export const makeExtSchema = (schema) => {
    const s = S.Any.annotate({
        aspect: schema,
    });
    return new Proxy(() => { }, {
        get: (_target, prop) => s[prop],
        apply: (_target, _thisArg, [template, ...references]) => {
            return S.annotate({
                aspect: {
                    ...schema,
                    template,
                    references,
                },
            });
        },
    });
};
export const func = ((input, output) => S.Any.annotate({
    aspect: {
        type: "fn",
        input: output ? input : undefined,
        output: output ?? input,
    },
}));
export const effect = (a, err = S.Never, req = S.Never) => S.Any.annotate({
    aspect: {
        type: "effect",
        a: a,
        err: err,
        req: req,
    },
});
export const stream = (a, err = S.Never, req = S.Never) => S.Any.annotate({
    aspect: {
        type: "stream",
        a: a,
        err: err,
        req: req,
    },
});
export const sink = (a, _in = S.Never, l = S.Never, err = S.Never, req = S.Never) => S.Any.annotate({
    aspect: {
        type: "sink",
        a: a,
        in: _in,
        l: l,
        err: err,
        req: req,
    },
});
//# sourceMappingURL=Schema.js.map