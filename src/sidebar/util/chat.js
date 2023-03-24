/**
 * Calculate the cost of tokens sent via OpenAI call
 *
 * @param {number} tokenCount
 */
export function tokenCost(tokenCount) {
  return Number(tokenCount * 0.000002).toFixed(4);
}

/**
 * Calculate the total number of tokens sent via OpenAI calls
 *
 * @param {Array<import("../../types/chat").Chat>} chats
 * @param {string} count
 */
export function tokenCount(chats, count) {
  let totalTokens = 0;
  
    chats.forEach((item) => {
      if (item.messages) {
        item.messages.forEach((message) => {
          if (message.role === 'assistant' && message.usage) {
            totalTokens += message.usage[count] ?? 0;
          }
        });
      }
    });

  return totalTokens;
}
