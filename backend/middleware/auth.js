const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user still exists
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Check if token is in user's tokens list (if implementing token blacklisting)
      if (user.invalidatedTokens && user.invalidatedTokens.includes(token)) {
        throw new Error('Token has been invalidated');
      }

      // Check token expiration
      if (decoded.exp < Date.now() / 1000) {
        throw new Error('Token has expired');
      }

      // Add user and token to request
      req.user = user;
      req.token = token;
      
      // Update last activity timestamp
      user.lastActive = new Date();
      await user.save();

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Token is invalid or has expired' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(500).json({ message: 'Server error in auth middleware' });
  }
};

// Middleware for role-based access control
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    next();
  };
};

// Middleware to check if user owns the resource
const isResourceOwner = (resourceModel) => async (req, res, next) => {
  try {
    const resource = await resourceModel.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this resource' });
    }

    req.resource = resource;
    next();
  } catch (error) {
    console.error('Resource ownership check failed:', error.message);
    res.status(500).json({ message: 'Server error checking resource ownership' });
  }
};

// Rate limiting middleware
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
};

// Session activity tracking
const trackActivity = async (req, res, next) => {
  try {
    if (req.user) {
      const activity = {
        timestamp: new Date(),
        action: req.method,
        route: req.originalUrl,
        ip: req.ip
      };

      req.user.recentActivity = [
        activity,
        ...(req.user.recentActivity || []).slice(0, 9)
      ];

      await req.user.save();
    }
    next();
  } catch (error) {
    console.error('Activity tracking failed:', error.message);
    next();
  }
};

module.exports = {
  auth,
  authorize,
  isResourceOwner,
  rateLimit,
  trackActivity
}; 