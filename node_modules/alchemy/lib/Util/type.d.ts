export type type<T> = new () => T;
export declare const type: new <T>() => T;
export declare namespace type {
    type of<T extends type<any>> = InstanceType<T>;
}
//# sourceMappingURL=type.d.ts.map