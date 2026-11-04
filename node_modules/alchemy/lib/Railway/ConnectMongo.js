import * as Data from "effect/Data";
import * as Binding from "../Binding.js";
export const ConnectMongo = Binding.Service("Railway.ConnectMongo");
export const connectEnvKeys = (mongo) => {
    const id = mongo.LogicalId.replaceAll(/[^a-zA-Z0-9]/g, "_").toUpperCase();
    return {
        pooled: `RAILWAY_MONGO_${id}_POOLED`,
        direct: `RAILWAY_MONGO_${id}_DIRECT`,
    };
};
export class MongoUrlMissing extends Data.TaggedError("Railway.MongoUrlMissing") {
}
//# sourceMappingURL=ConnectMongo.js.map