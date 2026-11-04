import * as kvws from "@distilled.cloud/aws/kinesis-video-webrtc-storage";
import * as Layer from "effect/Layer";
import { makeChannelSignalingHttpBinding } from "./BindingHttp.js";
import { JoinStorageSession } from "./JoinStorageSession.js";
export const JoinStorageSessionHttp = Layer.effect(JoinStorageSession, makeChannelSignalingHttpBinding({
    tag: "AWS.KinesisVideo.JoinStorageSession",
    // served by the channel's WEBRTC storage endpoint (only available once
    // media storage is configured for the channel)
    protocol: "WEBRTC",
    role: "MASTER",
    actions: ["kinesisvideo:JoinStorageSession"],
    key: "channelArn",
    operation: kvws.joinStorageSession,
}));
//# sourceMappingURL=JoinStorageSessionHttp.js.map