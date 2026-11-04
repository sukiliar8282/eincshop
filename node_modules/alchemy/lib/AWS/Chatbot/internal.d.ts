import type * as chatbot from "@distilled.cloud/aws/chatbot";
/**
 * Convert a plain tag map to the Chatbot wire `Tag` list
 * (`{ TagKey, TagValue }`).
 */
export declare const toChatbotTags: (tags: Record<string, string>) => chatbot.Tag[];
/**
 * Convert an observed Chatbot wire `Tag` list to a plain tag map.
 */
export declare const fromChatbotTags: (tags: readonly chatbot.Tag[] | undefined) => Record<string, string>;
//# sourceMappingURL=internal.d.ts.map