import * as Effect from "effect/Effect";
export const Tool = ((name) => name
    ? (template, ...refs) => makeTool(name, template, refs)
    : (name) => (template, ...refs) => makeTool(name, template, refs));
const makeTool = (name, template, refs) => Object.assign(function (impl) { }, {
    "~alchemy/Kind": "Tool",
    "~alchemy/Name": name,
    refs,
    template,
});
//# sourceMappingURL=Tool.js.map