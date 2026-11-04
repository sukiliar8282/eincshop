import * as S from "effect/Schema";
export type Parameter<Name extends string = string, Schema extends S.Top = S.Top, Refs extends any[] = any[]> = {
    "~alchemy/Kind": "Param";
    "~alchemy/Name": Name;
    schema: Schema;
    template: TemplateStringsArray;
    refs: Refs;
};
export declare const Parameter: {
    <const Name extends string>(name: Name): {
        <Schema extends S.Top>(schema: Schema): {
            <Refs extends any[]>(template: TemplateStringsArray, ...refs: Refs): Parameter<Name, Schema, Refs>;
        };
    };
    <const Name extends string, Schema extends S.Top>(name: Name, schema: Schema): {
        <Refs extends any[]>(template: TemplateStringsArray, ...refs: Refs): Parameter<Name, Schema, Refs>;
    };
};
//# sourceMappingURL=Parameter.d.ts.map