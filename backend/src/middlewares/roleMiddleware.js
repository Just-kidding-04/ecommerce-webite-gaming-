const { User } = require('../models');

// Middleware to check if user has admin role
const adminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Fetch fresh user data from DB
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.userRole = user.role;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Middleware to check if user has seller role (or admin)
const sellerOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Fetch fresh user data from DB
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.role !== 'seller' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Seller access required' });
    }

    req.userRole = user.role;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Middleware to check if user role is one of allowed roles
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Fetch fresh user data from DB
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: `Access denied. Required roles: ${allowedRoles.join(', ')}` });
      }

      req.userRole = user.role;
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

module.exports = {
  adminOnly,
  sellerOnly,
  requireRole
};
