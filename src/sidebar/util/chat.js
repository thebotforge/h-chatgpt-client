
/**
 * Calculate the cost of tokens sent via OpenAI call
 *
 * @param {number} tokenCount
 */
export function tokenCost(tokenCount){
    return Number(tokenCount * 0.000002).toFixed(4)
}