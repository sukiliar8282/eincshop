import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RouteCalculatorProps {
    /**
     * Name of the route calculator. Immutable — changing it replaces the
     * calculator.
     * @default ${app}-${stage}-${id}
     */
    calculatorName?: string;
    /**
     * Data provider for routing. Immutable — changing it replaces the
     * calculator. One of `Esri`, `Grab`, or `Here`.
     */
    dataSource: string;
    /**
     * Optional description of the route calculator resource.
     */
    description?: string;
    /**
     * Tags to associate with the route calculator.
     */
    tags?: Record<string, string>;
}
export interface RouteCalculator extends Resource<"AWS.Location.RouteCalculator", RouteCalculatorProps, {
    /** Physical name of the route calculator. */
    calculatorName: string;
    /** ARN of the route calculator. */
    calculatorArn: string;
    /** Data provider backing the calculator. */
    dataSource: string;
    /** Description of the route calculator. */
    description: string | undefined;
    /** Tags currently associated with the calculator. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Location Service route calculator. A route calculator computes
 * routes and route matrices against a chosen data provider. The data source
 * is immutable; the description can be updated in place.
 *
 * ### Creating Route Calculators
 * **Example:** Basic Route Calculator
 * ```typescript
 * import * as Location from "alchemy/AWS/Location";
 *
 * const calculator = yield* Location.RouteCalculator("Routes", {
 *   dataSource: "Esri",
 * });
 * ```
 *
 * @resource
 */
export declare const RouteCalculator: import("../../Resource.ts").ResourceClass<RouteCalculator>;
export declare const RouteCalculatorProvider: () => import("effect/Layer").Layer<Provider.Provider<RouteCalculator>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=RouteCalculator.d.ts.map