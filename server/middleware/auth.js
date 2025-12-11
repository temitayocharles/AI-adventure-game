
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_ALGO = 'HS256';

/**
 * JWT Middleware - Verify Bearer token in Authorization header
 * Sets req.user = { id, username } if valid
 * Usage: app.get('/api/v1/protected', requireAuth, handler)
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized: missing or invalid token" });
  }
  
  const token = authHeader.slice(7); // Remove "Bearer "
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGO] });
    req.user = decoded; // { id, username, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: invalid token", details: err.message });
  }
};

/**
 * Legacy middleware for backwards compatibility
 * DEPRECATED: Use requireAuth instead
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const userId = req.headers['x-user-id'] || req.body?.userId;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGO] });
      req.user = decoded;
      return next();
    } catch (err) {
      // Fall through to x-user-id check
    }
  }
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: missing user ID or token" });
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
 * Rate limiting for API requests (per-user, in-memory)
 * Usage: app.post('/api/v1/endpoint', rateLimitMiddleware, handler)
 */
const requestCounts = new Map();

export const rateLimitMiddleware = (req, res, next) => {
  const userId = req.user?.id || req.headers['x-user-id'] || 'anonymous';
  const limit = 100; // requests per 1 hour
  const window = 60 * 60 * 1000; // 1 hour
  
  const now = Date.now();
  const key = `${userId}:${Math.floor(now / window)}`;
  const count = (requestCounts.get(key) || 0) + 1;
  
  requestCounts.set(key, count);
  
  // Cleanup old entries periodically (1% of requests)
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

/**
 * Generate JWT token for player
 * Usage: const token = generateJWT(playerId, username)
 */
export const generateJWT = (playerId, username) => {
  return jwt.sign(
    { id: playerId, username },
    JWT_SECRET,
    { algorithm: JWT_ALGO, expiresIn: '7d' }
  );
};
