import * as Layer from "effect/Layer";
import { makeRedisBinding } from "./RedisBinding.js";
import { makeReadRedisClient } from "./RedisHttp.js";
import { ReadRedis } from "./ReadRedis.js";
/**
 * HTTP implementation of {@link ReadRedis}.
 *
 * @layer
 * @provides Fly.ReadRedis
 */
export const ReadRedisHttp = Layer.effect(ReadRedis, makeRedisBinding({
    makeClient: makeReadRedisClient,
}));
//# sourceMappingURL=ReadRedisHttp.js.map