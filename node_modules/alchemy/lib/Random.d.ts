import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Provider from "./Provider.ts";
import { Resource } from "./Resource.ts";
export interface RandomProps {
    /**
     * Number of random bytes to generate before hex encoding.
     * @default 32
     */
    bytes?: number;
}
export type Random = Resource<"Alchemy.Random", RandomProps, {
    text: Redacted.Redacted<string>;
}>;
export declare const makeRandom: (id: string, props?: RandomProps) => Effect.Effect<import("./Output.ts").ObjectExpr<Redacted.Redacted<string>, never>, never, Provider.Provider<Random>>;
/**
 * A deterministic-in-state random secret generator.
 *
 * The value is generated once on create and then persisted in state so
 * subsequent deploys keep the same secret unless the resource is replaced.
 */
export declare const Random: import("./Resource.ts").ResourceClass<Random>;
export declare const RandomProvider: () => import("effect/Layer").Layer<Provider.Provider<Random>, never, never>;
//# sourceMappingURL=Random.d.ts.map