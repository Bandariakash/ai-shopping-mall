const { query, pool } = require('../db');

/**
 * POST /api/checkout
 * Process cart, create order and order items in a transaction
 */
async function processCheckout(req, res) {
  const client = await pool.connect();
  try {
    const { items, shippingAddress, name, creditCard, email } = req.validatedBody || req.body;
    const userId = req.user?.userId || null;

    await client.query('BEGIN');

    // Verify all products exist and have sufficient stock
    const productIds = items.map(item => item.productId);
    const placeholders = productIds.map((_, i) => `$${i + 1}`).join(', ');
    const productsResult = await client.query(
      `SELECT id, name, price, stock_quantity FROM products WHERE id IN (${placeholders})`,
      productIds
    );

    if (productsResult.rows.length !== productIds.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'One or more products not found' });
    }

    // Check stock and calculate total
    const productMap = {};
    for (const product of productsResult.rows) {
      productMap[product.id] = product;
    }

    let totalAmount = 0;
    for (const item of items) {
      const product = productMap[item.productId];
      if (product.stock_quantity < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}`,
        });
      }
      totalAmount += parseFloat(product.price) * item.quantity;
    }

    // Get or create user by email
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      let userResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      if (userResult.rows.length === 0) {
        userResult = await client.query(
          'INSERT INTO users (email) VALUES ($1) RETURNING id',
          [email]
        );
      }
      resolvedUserId = userResult.rows[0].id;
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address) 
       VALUES ($1, $2, 'completed', $3) RETURNING id`,
      [resolvedUserId, totalAmount.toFixed(2), `${name}, ${shippingAddress}`]
    );
    const orderId = orderResult.rows[0].id;

    // Create order items and update stock
    for (const item of items) {
      const product = productMap[item.productId];
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_time) 
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.productId, item.quantity, product.price]
      );

      // Decrement stock
      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [item.quantity, item.productId]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      orderId,
      totalAmount: totalAmount.toFixed(2),
      itemCount: items.length,
      message: 'Order placed successfully! Thank you for shopping at the AI Mall.',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Checkout failed. Please try again.' });
  } finally {
    client.release();
  }
}

/**
 * GET /api/orders
 * Fetch order history for a user by email
 */
async function getOrders(req, res) {
  try {
    const { email } = req.query;
    const userId = req.user?.userId;

    let resolvedUserId = userId;

    if (!resolvedUserId && email) {
      const userResult = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (userResult.rows.length > 0) {
        resolvedUserId = userResult.rows[0].id;
      }
    }

    if (!resolvedUserId) {
      return res.json({ orders: [] });
    }

    const ordersResult = await query(
      `SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', p.name,
            'product_image', p.image_url,
            'store_name', s.name,
            'quantity', oi.quantity,
            'price_at_time', oi.price_at_time
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN stores s ON s.id = p.store_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [resolvedUserId]
    );

    res.json({ orders: ordersResult.rows });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

/**
 * GET /api/orders/:orderId
 * Fetch a specific order
 */
async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;

    const result = await query(
      `SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', p.name,
            'product_image', p.image_url,
            'store_name', s.name,
            'quantity', oi.quantity,
            'price_at_time', oi.price_at_time
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN stores s ON s.id = p.store_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order: result.rows[0] });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

module.exports = { processCheckout, getOrders, getOrderById };

