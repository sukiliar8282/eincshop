import { isOutput } from "../Output.js";
// @ts-expect-error - we want to allow any value to be checked for unknown
export const isUnknown = (value) => isOutput(value);
//# sourceMappingURL=unknown.js.map