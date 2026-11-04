import * as Context from "effect/Context";
export declare const GenericService: <Fn extends (T: {
    Type: string;
}) => Context.Service<any, any> = (...args: any[]) => Context.Service<any, any>>() => <Kind extends string>(Kind: Kind) => ReturnType<Fn> & Fn;
//# sourceMappingURL=service.d.ts.map