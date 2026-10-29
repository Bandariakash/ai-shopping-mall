const Groq = require('groq-sdk');

let groqClient = null;

function getGroqClient() {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

const SYSTEM_INSTRUCTION = `You are the AI Concierge for an expansive virtual shopping mall. Your goal is to be helpful, polite, and efficient. You have access to the mall's product database. When a user asks for recommendations, you must provide a brief conversational response AND output a structured JSON array of recommended product IDs that perfectly match their request. Do not hallucinate products that do not exist in the provided inventory context. Always be enthusiastic and helpful, as if you are a knowledgeable personal shopper who knows every item in the mall. If asked about non-shopping topics, gently redirect the conversation back to helping them find great products.

IMPORTANT: You MUST always respond with valid JSON in exactly this format:
{
  "concierge_message": "Your helpful conversational reply here",
  "recommended_product_ids": ["uuid1", "uuid2"]
}
Never include any text outside the JSON object.`;

/**
 * Generate AI Concierge response using Groq
 * @param {string} userMessage - Current user message
 * @param {Array} chatHistory - Last 5 chat messages for context
 * @param {Array} products - All available products for context
 * @returns {Object} { concierge_message, recommended_product_ids }
 */
async function generateConciergeResponse(userMessage, chatHistory = [], products = []) {
  const groq = getGroqClient();

  // Build compact inventory context (stay within token limits)
  const inventoryContext = products.slice(0, 100).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ? p.description.slice(0, 120) : '',
    price: parseFloat(p.price),
    store: p.store_name,
    category: p.store_category,
    stock: p.stock_quantity,
  }));

  // Build conversation history for context
  const historyText =
    chatHistory.length > 0
      ? `\nRecent conversation:\n${chatHistory
          .map((m) => `${m.is_ai ? 'Concierge' : 'User'}: ${m.message}`)
          .join('\n')}`
      : '';

  const userPrompt = `Available Mall Inventory (JSON):
${JSON.stringify(inventoryContext)}
${historyText}

User message: "${userMessage}"

Respond with ONLY a JSON object with keys "concierge_message" and "recommended_product_ids".`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const rawText = completion.choices[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Fallback: try extracting JSON block
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse Groq response as JSON');
      }
    }

    // Validate recommended IDs exist in actual inventory
    const validIds = new Set(inventoryContext.map((p) => p.id));
    const validatedIds = (parsed.recommended_product_ids || []).filter((id) =>
      validIds.has(id)
    );

    return {
      concierge_message:
        parsed.concierge_message ||
        "I'm here to help you find the perfect products!",
      recommended_product_ids: validatedIds,
    };
  } catch (error) {
    console.error('❌ Groq API error:', error.message);
    throw new Error(`AI service error: ${error.message}`);
  }
}

module.exports = { generateConciergeResponse };
