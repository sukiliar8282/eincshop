import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface VariableProps {
    /**
     * Name of the variable. If omitted, a unique lowercase name is generated
     * from the app, stage, and logical ID. Changing the name replaces the
     * variable.
     */
    name?: string;
    /**
     * The data type of the variable: `STRING`, `INTEGER`, `FLOAT`, `BOOLEAN`, or
     * `DATETIME`. Immutable — changing it replaces the variable.
     */
    dataType: string;
    /**
     * The source of the variable's value: `EVENT`, `MODEL_SCORE`, or
     * `EXTERNAL_MODEL_SCORE`. Immutable — changing it replaces the variable.
     */
    dataSource: string;
    /**
     * The default value used when the variable is missing from an event. This is
     * an in-place update.
     */
    defaultValue: string;
    /**
     * Human-readable description. This is an in-place update.
     */
    description?: string;
    /**
     * The semantic variable type (e.g. `IP_ADDRESS`, `PRICE`, `EMAIL_ADDRESS`).
     * If omitted, Fraud Detector infers one. This is an in-place update.
     */
    variableType?: string;
    /**
     * User-defined tags for the variable.
     */
    tags?: Record<string, string>;
}
export interface Variable extends Resource<"AWS.FraudDetector.Variable", VariableProps, {
    /** The name of the variable. */
    name: string;
    /** The ARN of the variable. */
    arn: string;
    /** The data type of the variable, e.g. `STRING` or `FLOAT`. */
    dataType: string;
    /** The data source of the variable, e.g. `EVENT`. */
    dataSource: string;
}, never, Providers> {
}
/**
 * An Amazon Fraud Detector variable — a named input to fraud-detection models
 * and rules, typed and sourced from event data or model scores. Variables are
 * cheap metadata objects.
 *
 * ### Creating a Variable
 * **Example:** Event Variable
 * ```typescript
 * const email = yield* FraudDetector.Variable("email", {
 *   dataType: "STRING",
 *   dataSource: "EVENT",
 *   defaultValue: "unknown",
 *   variableType: "EMAIL_ADDRESS",
 * });
 * ```
 *
 * @resource
 */
export declare const Variable: import("../../Resource.ts").ResourceClass<Variable>;
export declare const VariableProvider: () => import("effect/Layer").Layer<Provider.Provider<Variable>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Variable.d.ts.map