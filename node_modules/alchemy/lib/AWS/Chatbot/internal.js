/**
 * Convert a plain tag map to the Chatbot wire `Tag` list
 * (`{ TagKey, TagValue }`).
 */
export const toChatbotTags = (tags) => Object.entries(tags).map(([TagKey, TagValue]) => ({ TagKey, TagValue }));
/**
 * Convert an observed Chatbot wire `Tag` list to a plain tag map.
 */
export const fromChatbotTags = (tags) => Object.fromEntries((tags ?? []).map((t) => [t.TagKey, t.TagValue]));
//# sourceMappingURL=internal.js.map