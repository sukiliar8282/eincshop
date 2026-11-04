import { Credentials } from "@distilled.cloud/fly-io";
import type * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { RuntimeContext } from "../RuntimeContext.ts";
import type { Sprite } from "./Sprite.ts";
/**
 * Shared scaffolding for HTTP-backed Fly Sprite bindings.
 *
 * Captures ambient `FLY_API_TOKEN` during stack-eval (so Actions work
 * in-process) and, when the host is a {@link Sprite}, {@link Service},
 * or {@link Machine}, injects `FLY_API_TOKEN` into the host env.
 * Runtime calls inside a deployed host read that env via
 * {@link CredentialsFromEnv}. Distilled mints a Sprites bearer from it.
 *
 * NOT exported from `index.ts`.
 */
export declare const makeHttpSpriteBinding: <Client>(options: {
    makeClient: (auth: SpriteAuth, spriteName: Effect.Effect<string>) => Client;
}) => Effect.Effect<(sprite: Sprite) => Effect.Effect<Client, never, never>, never, Credentials | HttpClient.HttpClient>;
export interface SpriteAuth {
    authorize: <A, E>(eff: Effect.Effect<A, E, Credentials | HttpClient.HttpClient>) => Effect.Effect<A, E, RuntimeContext>;
}
export declare const makeSpriteAuth: (ambient: Context.Context<Credentials | HttpClient.HttpClient>) => SpriteAuth;
//# sourceMappingURL=SpriteHttp.d.ts.map