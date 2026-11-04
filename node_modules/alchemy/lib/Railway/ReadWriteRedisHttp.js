import * as Layer from "effect/Layer";
import { ReadWriteRedis } from "./ReadWriteRedis.js";
import { makeRedisBinding } from "./RedisBinding.js";
import { makeReadWriteRedisClient } from "./RedisHttp.js";
/**
 * HTTP implementation of {@link ReadWriteRedis}.
 *
 * @layer
 * @provides Railway.ReadWriteRedis
 */
export const ReadWriteRedisHttp = Layer.effect(ReadWriteRedis, makeRedisBinding({
    makeClient: makeReadWriteRedisClient,
}));
//# sourceMappingURL=ReadWriteRedisHttp.js.map