const { query } = require('../db');

/**
 * GET /api/products
 * Fetch products with optional filters: storeId, search, category
 */
async function getProducts(req, res) {
  try {
    const { storeId, search, category, page = 1, limit = 20 } = req.validatedQuery || req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = `
      SELECT 
        p.*,
        s.name as store_name,
        s.category as store_category
      FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (storeId) {
      sql += ` AND p.store_id = $${paramCount}`;
      params.push(storeId);
      paramCount++;
    }

    if (search) {
      sql += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (category) {
      sql += ` AND s.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    // Count total for pagination
    const countSql = sql.replace(
      'SELECT \n        p.*,\n        s.name as store_name,\n        s.category as store_category',
      'SELECT COUNT(*)'
    );
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].count);

    sql += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    const result = await query(sql, params);

    res.json({
      products: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

/**
 * GET /api/products/:productId
 * Fetch a single product by ID
 */
async function getProductById(req, res) {
  try {
    const { productId } = req.params;
    const result = await query(
      `SELECT p.*, s.name as store_name, s.category as store_category, s.description as store_description
       FROM products p
       JOIN stores s ON s.id = p.store_id
       WHERE p.id = $1`,
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

/**
 * GET /api/products/by-ids
 * Fetch multiple products by array of IDs (used by AI chat)
 */
async function getProductsByIds(req, res) {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ error: 'No product IDs provided' });
    }

    const idArray = Array.isArray(ids) ? ids : ids.split(',');

    if (idArray.length === 0 || idArray.length > 20) {
      return res.status(400).json({ error: 'Provide between 1 and 20 product IDs' });
    }

    const placeholders = idArray.map((_, i) => `$${i + 1}`).join(', ');
    const result = await query(
      `SELECT p.*, s.name as store_name, s.category as store_category
       FROM products p
       JOIN stores s ON s.id = p.store_id
       WHERE p.id IN (${placeholders})`,
      idArray
    );

    res.json({ products: result.rows });
  } catch (err) {
    console.error('Error fetching products by IDs:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

module.exports = { getProducts, getProductById, getProductsByIds };

