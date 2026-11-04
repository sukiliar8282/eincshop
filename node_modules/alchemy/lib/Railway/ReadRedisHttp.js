import * as Layer from "effect/Layer";
import { ReadRedis } from "./ReadRedis.js";
import { makeRedisBinding } from "./RedisBinding.js";
import { makeReadRedisClient } from "./RedisHttp.js";
/**
 * HTTP implementation of {@link ReadRedis}.
 *
 * @layer
 * @provides Railway.ReadRedis
 */
export const ReadRedisHttp = Layer.effect(ReadRedis, makeRedisBinding({
    makeClient: makeReadRedisClient,
}));
//# sourceMappingURL=ReadRedisHttp.js.map