import * as Context from "effect/Context";
export interface Self<R extends {
    Type: string;
    LogicalId: string;
} = {
    Type: string;
    LogicalId: string;
}> extends Context.ServiceClass<Self<R>, `Self<${R["Type"]}>`, R> {
}
export declare const Self: Self<{
    Type: string;
    LogicalId: string;
}> & (<R extends {
    Type: string;
    LogicalId: string;
}>(type: R["Type"]) => Self<R>);
//# sourceMappingURL=Self.d.ts.map