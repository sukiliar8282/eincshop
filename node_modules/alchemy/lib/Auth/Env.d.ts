import * as Effect from "effect/Effect";
import * as Interaction from "../Interaction.ts";
import { AuthError } from "./AuthProvider.ts";
export declare const getEnv: (key: string) => Effect.Effect<string | undefined, AuthError, never>;
export declare const getEnvRequired: (key: string) => Effect.Effect<string, AuthError, never>;
export declare const getEnvRedacted: (key: string) => Effect.Effect<import("effect/Redacted").Redacted<string> | undefined, AuthError, never>;
export declare const getEnvRedactedRequired: (key: string) => Effect.Effect<import("effect/Redacted").Redacted<string>, AuthError, never>;
export declare const mapPromptCancellation: <A, R>(self: Effect.Effect<A, Interaction.InteractionError, R>) => Effect.Effect<A, AuthError, R>;
//# sourceMappingURL=Env.d.ts.map