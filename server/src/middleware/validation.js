const { z } = require('zod');

// Chat message validation
const chatSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message must be 500 characters or less')
    .trim(),
  sessionId: z.string().uuid().optional(),
});

// Checkout validation
const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID format'),
        quantity: z.number().int().positive('Quantity must be a positive integer'),
        price: z.number().positive('Price must be positive'),
        name: z.string().min(1),
      })
    )
    .min(1, 'Cart must have at least one item'),
  shippingAddress: z
    .string()
    .min(10, 'Shipping address must be at least 10 characters')
    .max(500),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  creditCard: z
    .string()
    .regex(/^\d{16}$/, 'Credit card must be exactly 16 digits'),
  email: z.string().email('Invalid email address'),
});

// Product search validation
const productSearchSchema = z.object({
  storeId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

// Auth schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Middleware factory for request body validation
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.validatedBody = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * Middleware factory for query param validation
 */
function validateQuery(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query);
      req.validatedQuery = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}

module.exports = {
  chatSchema,
  checkoutSchema,
  productSearchSchema,
  registerSchema,
  loginSchema,
  validate,
  validateQuery,
};

