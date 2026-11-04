import * as Layer from "effect/Layer";
import { makeRedisBinding } from "./RedisBinding.js";
import { makeWriteRedisClient } from "./RedisHttp.js";
import { WriteRedis } from "./WriteRedis.js";
/**
 * HTTP implementation of {@link WriteRedis}.
 *
 * @layer
 * @provides Fly.WriteRedis
 */
export const WriteRedisHttp = Layer.effect(WriteRedis, makeRedisBinding({
    makeClient: makeWriteRedisClient,
}));
//# sourceMappingURL=WriteRedisHttp.js.map