import * as Layer from "effect/Layer";
import { makeRedisBinding } from "./RedisBinding.js";
import { makeReadWriteRedisClient } from "./RedisHttp.js";
import { ReadWriteRedis } from "./ReadWriteRedis.js";
/**
 * HTTP implementation of {@link ReadWriteRedis}.
 *
 * @layer
 * @provides Fly.ReadWriteRedis
 */
export const ReadWriteRedisHttp = Layer.effect(ReadWriteRedis, makeRedisBinding({
    makeClient: makeReadWriteRedisClient,
}));
//# sourceMappingURL=ReadWriteRedisHttp.js.map