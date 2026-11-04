import type { Plan } from "../../../Plan.ts";
import { Screen } from "../../CliKit/index.ts";
import type { PlanTreeData } from "./PlanTree.ts";
export interface PlanDecisionChoice<Value> {
    readonly value: Value;
    readonly label: string;
}
export declare const planDecisionScreen: <Value>(options: {
    readonly plan: Plan | PlanTreeData;
    readonly label?: string;
    readonly message: string;
    readonly choices: ReadonlyArray<PlanDecisionChoice<Value>>;
    readonly initialValue: Value;
}) => Screen<Value>;
//# sourceMappingURL=PlanDecision.d.ts.map