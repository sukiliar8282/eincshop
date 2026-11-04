import * as Output from "./Output.js";
// special runtime-only symbol for probing the Ref proxy for its metadata
const RefMetadata = Symbol.for("alchemy/RefMetadata");
export const isRef = (s) => s && s[RefMetadata] !== undefined;
export const getRefMetadata = (ref) => ref[RefMetadata];
export const ref = (id, { stack, stage, } = {}, type) => {
    const ref = new Proxy({}, {
        get: (_, prop) => {
            if (prop === RefMetadata) {
                return {
                    stack,
                    stage,
                    id,
                    type,
                };
            }
            return Output.of(ref)[prop];
        },
    });
    return ref;
};
//# sourceMappingURL=Ref.js.map