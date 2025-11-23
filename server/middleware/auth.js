
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  const userId = req.headers['x-user-id'] || req.body?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: missing user ID" });
  }

  req.userId = userId;
  next();
};

export const adminAuthMiddleware = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: "Forbidden: admin access required" });
  }
  
  next();
};

/**
 * Rate limiting for AI queries (per-user)
 * Usage: app.post('/api/v1/ai/query', rateLimitMiddleware, handler)
 */
const requestCounts = new Map();

export const rateLimitMiddleware = (req, res, next) => {
  const userId = req.headers['x-user-id'] || 'anonymous';
  const limit = 100; // requests per 1 hour
  const window = 60 * 60 * 1000; // 1 hour
  
  const now = Date.now();
  const key = `${userId}:${Math.floor(now / window)}`;
  const count = (requestCounts.get(key) || 0) + 1;
  
  requestCounts.set(key, count);
  
  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    for (const [k] of requestCounts.entries()) {
      if (now - parseInt(k.split(':')[1]) * window > window * 2) {
        requestCounts.delete(k);
      }
    }
  }
  
  if (count > limit) {
    return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
  }
  
  res.setHeader('X-RateLimit-Remaining', limit - count);
  next();
};
