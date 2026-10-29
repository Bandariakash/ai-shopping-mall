const { query } = require('../db');
const { generateConciergeResponse } = require('../services/groq');

/**
 * POST /api/chat
 * Process user message through Groq AI and return structured response
 */
async function handleChat(req, res) {
  try {
    const { message, sessionId } = req.validatedBody || req.body;
    const userId = req.user?.userId || null;

    // Fetch all products for AI context
    const productsResult = await query(
      `SELECT p.id, p.name, p.description, p.price, p.stock_quantity, 
              s.name as store_name, s.category as store_category
       FROM products p
       JOIN stores s ON s.id = p.store_id
       WHERE p.stock_quantity > 0
       ORDER BY s.category, p.name`
    );

    // Fetch last 5 chat messages for context (if user is authenticated)
    let chatHistory = [];
    if (userId) {
      const historyResult = await query(
        `SELECT message, is_ai FROM chat_sessions 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 10`,
        [userId]
      );
      chatHistory = historyResult.rows.reverse();
    }

    // Call Groq AI
    const aiResponse = await generateConciergeResponse(
      message,
      chatHistory.slice(-5),
      productsResult.rows
    );

    // Save user message to chat history (if authenticated)
    if (userId) {
      await query(
        `INSERT INTO chat_sessions (user_id, message, is_ai) VALUES ($1, $2, false)`,
        [userId, message]
      );
      // Save AI response to chat history
      await query(
        `INSERT INTO chat_sessions (user_id, message, is_ai) VALUES ($1, $2, true)`,
        [userId, aiResponse.concierge_message]
      );
    }

    // Fetch full product details for recommended IDs
    let recommendedProducts = [];
    if (aiResponse.recommended_product_ids && aiResponse.recommended_product_ids.length > 0) {
      const ids = aiResponse.recommended_product_ids.slice(0, 8); // Max 8 recommendations
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
      const productsDetail = await query(
        `SELECT p.*, s.name as store_name, s.category as store_category
         FROM products p
         JOIN stores s ON s.id = p.store_id
         WHERE p.id IN (${placeholders})`,
        ids
      );
      recommendedProducts = productsDetail.rows;
    }

    res.json({
      message: aiResponse.concierge_message,
      recommendedProducts,
      recommendedProductIds: aiResponse.recommended_product_ids,
    });
  } catch (err) {
    console.error('Error in chat handler:', err);
    res.status(500).json({
      error: 'AI service temporarily unavailable',
      message: 'I apologize, I\'m having trouble connecting right now. Please try again in a moment!',
    });
  }
}

/**
 * GET /api/chat/history
 * Fetch chat history for authenticated user
 */
async function getChatHistory(req, res) {
  try {
    if (!req.user) {
      return res.json({ history: [] });
    }

    const result = await query(
      `SELECT * FROM chat_sessions 
       WHERE user_id = $1 
       ORDER BY created_at ASC 
       LIMIT 50`,
      [req.user.userId]
    );

    res.json({ history: result.rows });
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
}

module.exports = { handleChat, getChatHistory };

