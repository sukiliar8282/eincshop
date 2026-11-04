import * as chatbot from "@distilled.cloud/aws/chatbot";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
import { fromChatbotTags, toChatbotTags } from "./internal.js";
/**
 * An AWS Chatbot (Amazon Q Developer in chat applications) Slack channel
 * configuration that delivers SNS notifications to a Slack channel and lets
 * channel members run read-only or scoped AWS commands.
 *
 * The Slack workspace must be onboarded to AWS Chatbot beforehand via the
 * console OAuth flow (Chatbot console -> Configure new client -> Slack) —
 * workspace authorization cannot be automated.
 *
 * ### Creating Slack Channel Configurations
 * **Example:** Notify a Slack channel from an SNS topic
 * ```typescript
 * import * as Chatbot from "alchemy/AWS/Chatbot";
 * import { Role } from "alchemy/AWS/IAM/Role";
 * import * as SNS from "alchemy/AWS/SNS";
 *
 * const topic = yield* SNS.Topic("Alerts", {});
 * const role = yield* Role("ChatbotRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "chatbot.amazonaws.com" },
 *         Action: ["sts:AssumeRole"],
 *       },
 *     ],
 *   },
 *   managedPolicyArns: ["arn:aws:iam::aws:policy/ReadOnlyAccess"],
 * });
 *
 * const config = yield* Chatbot.SlackChannelConfiguration("Alerts", {
 *   slackTeamId: "T012ABCDEFG",
 *   slackChannelId: "C012AB3CD",
 *   iamRoleArn: role.roleArn,
 *   snsTopicArns: [topic.topicArn],
 *   loggingLevel: "ERROR",
 * });
 * ```
 *
 * @resource
 */
export const SlackChannelConfiguration = Resource("AWS.Chatbot.SlackChannelConfiguration");
export const SlackChannelConfigurationProvider = () => Provider.effect(SlackChannelConfiguration, Effect.gen(function* () {
    const createConfigurationName = Effect.fn(function* (id, props) {
        return (props.configurationName ??
            (yield* createPhysicalName({ id, maxLength: 128 })));
    });
    const configurationArn = Effect.fn(function* (configurationName) {
        const { accountId } = yield* AWSEnvironment.current;
        // Chatbot chat-configuration ARNs are global (no region component).
        return `arn:aws:chatbot::${accountId}:chat-configuration/slack-channel/${configurationName}`;
    });
    // describeSlackChannelConfigurations is a filter — an unknown ARN
    // yields an empty list rather than a not-found error.
    const observeConfiguration = (arn) => chatbot
        .describeSlackChannelConfigurations({ ChatConfigurationArn: arn })
        .pipe(Effect.map((r) => r.SlackChannelConfigurations?.[0]));
    const observedTags = (arn) => chatbot.listTagsForResource({ ResourceARN: arn }).pipe(Effect.map((r) => fromChatbotTags(r.Tags)), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({})));
    const toAttributes = (configurationName, live) => ({
        configurationName,
        chatConfigurationArn: live.ChatConfigurationArn,
        slackTeamId: live.SlackTeamId,
        slackChannelId: live.SlackChannelId,
        slackTeamName: live.SlackTeamName,
        state: live.State,
    });
    return SlackChannelConfiguration.Provider.of({
        stables: ["configurationName", "chatConfigurationArn", "slackTeamId"],
        list: () => Effect.gen(function* () {
            const configurations = yield* chatbot.describeSlackChannelConfigurations
                .items({})
                .pipe(Stream.runCollect);
            return Array.from(configurations).map((config) => {
                const arn = config.ChatConfigurationArn;
                return toAttributes(arn.slice(arn.lastIndexOf("/") + 1), config);
            });
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const configurationName = output?.configurationName ??
                (yield* createConfigurationName(id, olds ?? {}));
            const arn = output?.chatConfigurationArn ??
                (yield* configurationArn(configurationName));
            const found = yield* observeConfiguration(arn);
            if (found === undefined)
                return undefined;
            const attrs = toAttributes(configurationName, found);
            const tags = yield* observedTags(found.ChatConfigurationArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createConfigurationName(id, olds ?? {});
            const newName = yield* createConfigurationName(id, news ?? {});
            if (oldName !== newName || olds?.slackTeamId !== news.slackTeamId) {
                return { action: "replace" };
            }
            // fall through: engine default update logic for mutable fields
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const configurationName = output?.configurationName ??
                (yield* createConfigurationName(id, news));
            const arn = output?.chatConfigurationArn ??
                (yield* configurationArn(configurationName));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            const desiredTopics = [...(news.snsTopicArns ?? [])].sort();
            const desiredGuardrails = news.guardrailPolicyArns
                ? [...news.guardrailPolicyArns].sort()
                : undefined;
            // 1. OBSERVE — cloud state is authoritative.
            let live = yield* observeConfiguration(arn);
            // 2. ENSURE — create when missing; a concurrent create surfaces as
            //    the typed ConflictException, which we treat as a race and
            //    re-observe.
            if (live === undefined) {
                live = yield* chatbot
                    .createSlackChannelConfiguration({
                    SlackTeamId: news.slackTeamId,
                    SlackChannelId: news.slackChannelId,
                    SlackChannelName: news.slackChannelName,
                    ConfigurationName: configurationName,
                    IamRoleArn: news.iamRoleArn,
                    SnsTopicArns: news.snsTopicArns,
                    LoggingLevel: news.loggingLevel,
                    GuardrailPolicyArns: news.guardrailPolicyArns,
                    UserAuthorizationRequired: news.userAuthorizationRequired,
                    Tags: toChatbotTags(desiredTags),
                })
                    .pipe(Effect.map((r) => r.ChannelConfiguration), Effect.catchTag("ConflictException", () => observeConfiguration(arn)));
            }
            // 3. SYNC — diff the OBSERVED mutable aspects against the desired
            //    state; update only on drift.
            const inSync = live !== undefined &&
                live.SlackChannelId === news.slackChannelId &&
                live.IamRoleArn === news.iamRoleArn &&
                JSON.stringify([...live.SnsTopicArns].sort()) ===
                    JSON.stringify(desiredTopics) &&
                (live.LoggingLevel ?? "NONE") === (news.loggingLevel ?? "NONE") &&
                JSON.stringify(live.GuardrailPolicyArns
                    ? [...live.GuardrailPolicyArns].sort()
                    : undefined) === JSON.stringify(desiredGuardrails) &&
                (live.UserAuthorizationRequired ?? false) ===
                    (news.userAuthorizationRequired ?? false);
            if (!inSync) {
                live = yield* chatbot
                    .updateSlackChannelConfiguration({
                    ChatConfigurationArn: arn,
                    SlackChannelId: news.slackChannelId,
                    SlackChannelName: news.slackChannelName,
                    IamRoleArn: news.iamRoleArn,
                    SnsTopicArns: news.snsTopicArns,
                    LoggingLevel: news.loggingLevel,
                    GuardrailPolicyArns: news.guardrailPolicyArns,
                    UserAuthorizationRequired: news.userAuthorizationRequired,
                })
                    .pipe(Effect.map((r) => r.ChannelConfiguration));
            }
            // 3b. SYNC TAGS — diff against OBSERVED cloud tags so adoption
            //     converges (create-time Tags only apply on first create).
            const currentTags = yield* observedTags(arn);
            const { upsert, removed } = diffTags(currentTags, desiredTags);
            if (upsert.length > 0) {
                yield* chatbot.tagResource({
                    ResourceARN: arn,
                    Tags: upsert.map(({ Key, Value }) => ({
                        TagKey: Key,
                        TagValue: Value,
                    })),
                });
            }
            if (removed.length > 0) {
                yield* chatbot.untagResource({
                    ResourceARN: arn,
                    TagKeys: removed,
                });
            }
            yield* session.note(configurationName);
            return live !== undefined
                ? toAttributes(configurationName, live)
                : {
                    configurationName,
                    chatConfigurationArn: arn,
                    slackTeamId: news.slackTeamId,
                    slackChannelId: news.slackChannelId,
                    slackTeamName: "",
                    state: undefined,
                };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* chatbot
                .deleteSlackChannelConfiguration({
                ChatConfigurationArn: output.chatConfigurationArn,
            })
                .pipe(
            // Idempotent delete — a missing configuration is not an error.
            Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=SlackChannelConfiguration.js.map