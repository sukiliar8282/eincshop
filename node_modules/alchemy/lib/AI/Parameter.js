import * as S from "effect/Schema";
export const Parameter = ((name, schema) => schema
    ? (template, ...refs) => makeParameter(name, schema, template, refs)
    : (schema) => (template, ...refs) => makeParameter(name, schema, template, refs));
const makeParameter = (name, schema, template, refs) => Object.assign(function () { }, {
    "~alchemy/Kind": "Param",
    "~alchemy/Name": name,
    schema,
    template,
    refs,
});
//# sourceMappingURL=Parameter.js.map