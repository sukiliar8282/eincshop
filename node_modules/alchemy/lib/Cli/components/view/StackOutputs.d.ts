import type { ReactNode } from "react";
export interface StackOutputsProps {
    readonly value: unknown;
    readonly offset?: number;
    readonly limit?: number;
}
export declare function StackOutputs({ value, offset, limit, }: StackOutputsProps): import("react").JSX.Element;
export declare const stackOutputLineCount: (value: unknown) => number;
export declare const stackOutputsView: (value: unknown) => ReactNode;
//# sourceMappingURL=StackOutputs.d.ts.map