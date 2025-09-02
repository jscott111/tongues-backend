const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'MISSING_TOKEN'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Verify user still exists and is active
    const user = User.findUserById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(403).json({ 
        error: 'User not found or deactivated',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Middleware to authenticate WebSocket connections
 * Supports both JWT authentication and session-based connections
 */
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
  const sessionId = socket.handshake.auth.sessionId;

  // If session ID is provided, allow connection without JWT authentication
  if (sessionId) {
    console.log(`🔗 Received session ID: "${sessionId}" (length: ${sessionId.length})`);
    // Validate session ID format - now accepts 8-character alphanumeric codes
    if (!/^[A-Z0-9]{8}$/.test(sessionId)) {
      console.log(`🔗 Invalid session ID format: ${sessionId} (expected 8 alphanumeric characters)`);
      return next(new Error('Invalid session ID format'));
    }
    
    socket.sessionId = sessionId;
    socket.user = null; // No user for session-based connections
    console.log(`🔗 Session-based connection: ${sessionId}`);
    console.log(`🔗 Auth data:`, socket.handshake.auth);
    return next();
  }

  // If no session ID, require JWT authentication
  if (!token) {
    return next(new Error('Authentication token or session ID required'));
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Socket JWT verification error:', err.message);
      return next(new Error('Invalid or expired token'));
    }

    const user = User.findUserById(decoded.userId);
    if (!user || !user.isActive) {
      return next(new Error('User not found or deactivated'));
    }

    socket.user = user;
    socket.sessionId = sessionId; // Store session ID if provided
    next();
  });
};

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email 
    },
    JWT_SECRET,
    { 
      expiresIn: '24h',
      issuer: 'scribe-backend',
      audience: 'scribe-frontend'
    }
  );
};

/**
 * Generate refresh token for user
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      type: 'refresh'
    },
    JWT_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'scribe-backend',
      audience: 'scribe-frontend'
    }
  );
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
      return next();
    }

    const user = User.findUserById(decoded.userId);
    if (!user || !user.isActive) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
  authenticateSocket,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  optionalAuth
};
