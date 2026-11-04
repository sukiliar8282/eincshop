import * as Effect from "effect/Effect";
import type { Url } from "../Redis/index.ts";
import type { Redis } from "./Redis.ts";
export declare const REDIS_URL_ENV = "REDIS_URL";
export declare const makeRedisBinding: <Client>(options: {
    makeClient: (url: Url) => Client;
}) => Effect.Effect<(redis: Redis) => Effect.Effect<Client, never, never>, never, never>;
//# sourceMappingURL=RedisBinding.d.ts.map