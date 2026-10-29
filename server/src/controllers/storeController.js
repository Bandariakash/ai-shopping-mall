const { query } = require('../db');

/**
 * GET /api/stores
 * Fetch all stores, optionally filtered by category
 */
async function getStores(req, res) {
  try {
    const { category } = req.query;

    let sql = `
      SELECT 
        s.*,
        COUNT(p.id) as product_count
      FROM stores s
      LEFT JOIN products p ON p.store_id = s.id
    `;
    const params = [];

    if (category) {
      sql += ` WHERE s.category = $1`;
      params.push(category);
    }

    sql += ` GROUP BY s.id ORDER BY s.name ASC`;

    const result = await query(sql, params);
    res.json({ stores: result.rows });
  } catch (err) {
    console.error('Error fetching stores:', err);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
}

/**
 * GET /api/stores/:storeId
 * Fetch a single store by ID
 */
async function getStoreById(req, res) {
  try {
    const { storeId } = req.params;
    const result = await query(
      `SELECT s.*, COUNT(p.id) as product_count 
       FROM stores s 
       LEFT JOIN products p ON p.store_id = s.id 
       WHERE s.id = $1 
       GROUP BY s.id`,
      [storeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({ store: result.rows[0] });
  } catch (err) {
    console.error('Error fetching store:', err);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
}

module.exports = { getStores, getStoreById };

