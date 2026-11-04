import * as Context from "effect/Context";
export const GenericService = () => (Kind) => {
    const service = Context.Service(Kind);
    const make = (Type) => Context.Service(`${Kind}<${Type}>`);
    return Object.assign(Object.setPrototypeOf(make, service), service);
};
//# sourceMappingURL=service.js.map